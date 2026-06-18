<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    protected $table = 'feedbacks';

    protected $fillable = [
        'user_id',
        'period',
        'reviewer_name',
        'reviewer_role',
        'type',
        'category',
        'rating',
        'summary',
        'body',
        'status',
        'submitted_at',
        'acknowledged_at',
    ];

    protected $casts = [
        'rating' => 'decimal:1',
        'submitted_at' => 'datetime',
        'acknowledged_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
