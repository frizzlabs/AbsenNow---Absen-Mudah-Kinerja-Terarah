<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Timesheet extends Model
{
    use BelongsToOrganization;

    protected $fillable = [
        'organization_id',
        'user_id',
        'week_start_date',
        'week_end_date',
        'total_minutes',
        'activities_count',
        'status',
        'reviewer_name',
        'reviewer_note',
        'submitted_at',
        'reviewed_at',
    ];

    protected $casts = [
        'week_start_date' => 'date:Y-m-d',
        'week_end_date' => 'date:Y-m-d',
        'total_minutes' => 'integer',
        'activities_count' => 'integer',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(TimesheetEvent::class)->orderBy('created_at');
    }
}
