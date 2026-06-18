<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KpiHistory extends Model
{
    protected $table = 'kpi_histories';

    protected $fillable = [
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
