<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KpiHistory extends Model
{
    use BelongsToOrganization;

    protected $table = 'kpi_histories';

    protected $fillable = [
        'organization_id',
        'kpi_id',
        'label',
        'note',
        'event_date',
        'color',
    ];

    protected $casts = [
        'event_date' => 'date:Y-m-d',
    ];

    public function kpi(): BelongsTo
    {
        return $this->belongsTo(Kpi::class);
    }
}
