<?php

namespace App\Http\Controllers;

use App\Models\SurveyResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminSurveyController extends Controller
{
    public function analytics(): JsonResponse
    {
        $responses = SurveyResponse::query()->get();

        return response()->json([
            'total' => $responses->count(),
            'busType' => $this->summarize($responses->pluck('bus_type')),
            'demographic' => $this->summarize($responses->pluck('demographic')),
            'seatType' => $this->summarize($responses->pluck('seat_type')),
            'sleepComfort' => $this->summarize($responses->pluck('sleep_comfort')),
            'topPains' => $this->summarize(
                $responses->flatMap(fn (SurveyResponse $response) => $response->pain_points ?? []),
                10
            ),
        ]);
    }

    public function export(): StreamedResponse
    {
        $responses = SurveyResponse::query()->orderBy('id')->get();

        return response()->streamDownload(function () use ($responses): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'id',
                'bus_type',
                'route',
                'demographic',
                'seat_type',
                'pain_points',
                'sleep_comfort',
                'created_at',
            ]);

            foreach ($responses as $response) {
                fputcsv($handle, [
                    $response->id,
                    $response->bus_type,
                    $response->route,
                    $response->demographic,
                    $response->seat_type,
                    implode(' | ', $response->pain_points ?? []),
                    $response->sleep_comfort,
                    $response->created_at?->toDateTimeString(),
                ]);
            }

            fclose($handle);
        }, 'pces_survey_responses.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function destroyAllResponses(): JsonResponse
    {
        $deleted = SurveyResponse::query()->delete();

        return response()->json([
            'message' => 'All survey responses deleted successfully.',
            'deleted' => $deleted,
        ]);
    }

    /**
     * @return array<int, array{name: string, value: int}>
     */
    private function summarize(Collection $values, int $limit = 4): array
    {
        return $values
            ->filter(fn ($value) => is_string($value) && $value !== '')
            ->countBy()
            ->sortDesc()
            ->take($limit)
            ->map(fn (int $count, string $name) => [
                'name' => $name,
                'value' => $count,
            ])
            ->values()
            ->all();
    }
}