<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SurveyResponseTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'busType' => 'SLTB Bus',
            'route' => 'Colombo - Kandy',
            'demographic' => 'Male (30-90)',
            'seatType' => 'A',
            'hasPainPoints' => false,
            'painPoints' => [],
            'sleepComfort' => 'A',
        ], $overrides);
    }

    public function test_submit_survey_with_no_pain_points_succeeds()
    {
        $payload = $this->validPayload([
            'hasPainPoints' => false,
            'painPoints' => [],
        ]);

        $response = $this->postJson('/api/survey-responses', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('survey_responses', [
            'pain_points' => '[]',
        ]);
    }

    public function test_submit_survey_with_one_pain_point_succeeds()
    {
        $payload = $this->validPayload([
            'hasPainPoints' => true,
            'painPoints' => ['Long waiting time'],
        ]);

        $response = $this->postJson('/api/survey-responses', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('survey_responses', [
            'pain_points' => json_encode(['Long waiting time']),
        ]);
    }

    public function test_submit_survey_with_has_pain_points_true_but_empty_array_fails()
    {
        $payload = $this->validPayload([
            'hasPainPoints' => true,
            'painPoints' => [],
        ]);

        $response = $this->postJson('/api/survey-responses', $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['painPoints']);
    }

    public function test_submit_survey_with_too_many_pain_points_fails()
    {
        $payload = $this->validPayload([
            'hasPainPoints' => true,
            'painPoints' => array_fill(0, 21, 'A pain point'),
        ]);

        $response = $this->postJson('/api/survey-responses', $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['painPoints']);
    }

    public function test_submit_survey_with_oversized_pain_point_fails()
    {
        $payload = $this->validPayload([
            'hasPainPoints' => true,
            'painPoints' => [str_repeat('a', 256)],
        ]);

        $response = $this->postJson('/api/survey-responses', $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['painPoints.0']);
    }

    public function test_submit_survey_filters_or_rejects_empty_strings()
    {
        $payload = $this->validPayload([
            'hasPainPoints' => true,
            'painPoints' => ['Pain 1', '', '   '],
        ]);

        $response = $this->postJson('/api/survey-responses', $payload);

        // We expect it to either be rejected or cleaned. 
        // If it succeeds, the database should not have the empty strings.
        if ($response->status() === 201) {
            $this->assertDatabaseHas('survey_responses', [
                'pain_points' => json_encode(['Pain 1']),
            ]);
        } else {
            $response->assertStatus(422);
        }
    }

    public function test_legacy_style_payload_with_exactly_3_pain_points_succeeds()
    {
        $payload = $this->validPayload([
            'painPoints' => ['Pain 1', 'Pain 2', 'Pain 3'],
        ]);
        unset($payload['hasPainPoints']); // Simulate legacy payload

        $response = $this->postJson('/api/survey-responses', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('survey_responses', [
            'pain_points' => json_encode(['Pain 1', 'Pain 2', 'Pain 3']),
        ]);
    }
}
