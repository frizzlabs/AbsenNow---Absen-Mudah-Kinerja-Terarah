<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    use HasFactory, BelongsToOrganization;

    protected $fillable = [
        'organization_id',
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
