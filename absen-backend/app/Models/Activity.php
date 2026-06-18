<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Activity extends Model
{
    protected $fillable = [
        'user_id',
        'timesheet_id',
        'title',
        'project',
        'project_color',
        'category',
        'activity_date',
        'start_time',
        'end_time',
        'duration_minutes',
        'description',
    ];

    protected $casts = [
        'activity_date' => 'date:Y-m-d',
        'duration_minutes' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function timesheet(): BelongsTo
    {
        return $this->belongsTo(Timesheet::class);
    }
}
