<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SurveyResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'bus_type',
        'route',
        'demographic',
        'seat_type',
        'pain_points',
        'sleep_comfort',
    ];

    protected function casts(): array
    {
        return [
            'pain_points' => 'array',
        ];
    }
}