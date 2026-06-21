<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;

class DinasLuar extends Model
{
    use BelongsToOrganization;

    protected $table = 'dinas_luar';

    protected $fillable = [
        'organization_id',
        'user_id', 'location_name', 'latitude', 'longitude', 'radius',
        'start_datetime', 'end_datetime', 'work_details',
        'status', 'reviewed_by', 'reviewed_at', 'review_note',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime'   => 'datetime',
        'reviewed_at'    => 'datetime',
        'latitude'       => 'float',
        'longitude'      => 'float',
        'radius'         => 'integer',
    ];

    public function user()       { return $this->belongsTo(User::class); }
    public function reviewer()   { return $this->belongsTo(User::class, 'reviewed_by'); }
    public function attendances(){ return $this->hasMany(DinasLuarAttendance::class); }
}
