<?php

namespace App\Http\Controllers;

use App\Models\SurveyResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SurveyResponseController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'busType' => ['required', 'string', 'max:255'],
            'route' => ['required', 'string', 'max:255'],
            'demographic' => ['required', 'string', 'max:255'],
            'seatType' => ['required', 'string', 'max:255'],
            'painPoints' => ['required', 'array', 'size:3'],
            'painPoints.*' => ['required', 'string', 'max:255'],
            'sleepComfort' => ['required', 'string', 'max:255'],
        ]);

        $response = SurveyResponse::create([
            'bus_type' => $validated['busType'],
            'route' => $validated['route'],
            'demographic' => $validated['demographic'],
            'seat_type' => $validated['seatType'],
            'pain_points' => array_values($validated['painPoints']),
            'sleep_comfort' => $validated['sleepComfort'],
        ]);

        return response()->json([
            'message' => 'Survey response saved successfully.',
            'id' => $response->id,
        ], 201);
    }
}