<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Expense;
use Illuminate\Support\Facades\Storage;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $expenses = Expense::with('user')->where('user_id', $user->id)
            ->orderBy('expense_date', 'desc')
            ->get();
            
        return response()->json($expenses);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $expense = Expense::with('user')
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$expense) {
            return response()->json(['message' => 'Klaim reimbursement tidak ditemukan.'], 404);
        }

        return response()->json($expense);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'merchant' => 'required|string',
            'expense_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'receipt' => 'nullable|string', // base64 representation of the receipt file
            'receipt_name' => 'nullable|string',
        ]);

        $user = $request->user();

        // Process attachment/receipt
        $receiptPath = null;
        if ($request->receipt) {
            $receiptPath = $this->saveBase64File($request->receipt, $request->receipt_name ?? 'receipt');
        }

        $expense = Expense::create([
            'user_id' => $user->id,
            'category' => $request->category,
            'merchant' => $request->merchant,
            'expense_date' => $request->expense_date,
            'amount' => $request->amount,
            'notes' => $request->notes,
            'receipt_path' => $receiptPath,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Klaim reimbursement berhasil dikirim.',
            'expense' => $expense
        ]);
    }

    private function saveBase64File($base64String, $originalName)
    {
        if (!$base64String) {
            return null;
        }

        // Extract format data:image/png;base64,... or data:application/pdf;base64,...
        if (preg_match('/^data:([^;]+);base64,/', $base64String, $match)) {
            $mimeType = $match[1];
            $data = substr($base64String, strpos($base64String, ',') + 1);
            $data = base64_decode($data);
            
            if ($data === false) {
                return null;
            }

            // Map MIME to extension
            $extMap = [
                'image/jpeg' => 'jpg',
                'image/jpg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'application/pdf' => 'pdf',
                'application/msword' => 'doc',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            ];
            
            $ext = $extMap[$mimeType] ?? 'bin';
            $fileName = 'receipt_' . uniqid() . '.' . $ext;
            $directory = 'receipts';

            Storage::disk('public')->makeDirectory($directory);
            Storage::disk('public')->put($directory . '/' . $fileName, $data);

            return 'storage/receipts/' . $fileName;
        }

        return null;
    }
}
