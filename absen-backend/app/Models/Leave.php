<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'leave_type',
        'start_date',
        'end_date',
        'delegate_user_id',
        'reason',
        'attachment',
        'status',
        'total_days',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function delegateUser()
    {
        return $this->belongsTo(User::class, 'delegate_user_id');
    }
}
