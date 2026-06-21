<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimesheetEvent extends Model
{
    use BelongsToOrganization;

    protected $fillable = [
        'organization_id',
        'timesheet_id',
        'status',
        'actor_name',
        'note',
    ];

    public function timesheet(): BelongsTo
    {
        return $this->belongsTo(Timesheet::class);
    }
}
