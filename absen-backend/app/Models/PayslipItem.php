<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayslipItem extends Model
{
    use BelongsToOrganization;

    protected $fillable = [
        'organization_id',
        'payslip_id',
        'section',
        'title',
        'subtitle',
        'icon',
        'amount',
        'is_deduction',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_deduction' => 'boolean',
    ];

    public function payslip(): BelongsTo
    {
        return $this->belongsTo(Payslip::class);
    }
}
