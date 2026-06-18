<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceReview extends Model
{
    protected $fillable = [
        'user_id',
        'period',
        'overall_score',
        'status_label',
        'review_completion',
    ];

    protected $casts = [
        'overall_score' => 'integer',
        'review_completion' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
