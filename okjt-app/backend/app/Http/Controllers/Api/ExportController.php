<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PortfolioProject;
use App\Models\ContactSubmission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExportController extends Controller
{
    /**
     * Export portfolio projects to Excel
     */
    public function exportPortfolio(Request $request): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $query = PortfolioProject::with('tags')->ordered();

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('featured') && $request->featured) {
            $query->featured();
        }

        $projects = $query->get();

        return Excel::download(new PortfolioExport($projects), 'portfolio-projects-' . date('Y-m-d') . '.xlsx');
    }

    /**
     * Export contact submissions to Excel
     */
    public function exportSubmissions(Request $request): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $query = ContactSubmission::orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $submissions = $query->get();

        return Excel::download(new SubmissionsExport($submissions), 'contact-submissions-' . date('Y-m-d') . '.xlsx');
    }

    /**
     * Export portfolio projects to CSV
     */
    public function exportPortfolioCsv(Request $request): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $query = PortfolioProject::with('tags')->ordered();

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $projects = $query->get();

        return Excel::download(new PortfolioExport($projects), 'portfolio-projects-' . date('Y-m-d') . '.csv', \Maatwebsite\Excel\Excel::CSV);
    }

    /**
     * Export contact submissions to CSV
     */
    public function exportSubmissionsCsv(Request $request): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $query = ContactSubmission::orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        $submissions = $query->get();

        return Excel::download(new SubmissionsExport($submissions), 'contact-submissions-' . date('Y-m-d') . '.csv', \Maatwebsite\Excel\Excel::CSV);
    }
}

class PortfolioExport implements FromCollection, WithHeadings, WithMapping
{
    protected $projects;

    public function __construct($projects)
    {
        $this->projects = $projects;
    }

    public function collection()
    {
        return $this->projects;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Title',
            'Description',
            'Category',
            'Client Name',
            'Status',
            'Featured',
            'Project URL',
            'Tags',
            'Created At',
            'Updated At',
        ];
    }

    public function map($project): array
    {
        return [
            $project->id,
            $project->title,
            $project->description,
            $project->category,
            $project->client_name ?? '',
            $project->status,
            $project->featured ? 'Yes' : 'No',
            $project->project_url ?? '',
            $project->tags ? $project->tags->pluck('name')->join(', ') : '',
            $project->created_at->format('Y-m-d H:i:s'),
            $project->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}

class SubmissionsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $submissions;

    public function __construct($submissions)
    {
        $this->submissions = $submissions;
    }

    public function collection()
    {
        return $this->submissions;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Name',
            'Email',
            'Phone',
            'Contact Method',
            'Online Consultation',
            'Consultation Date',
            'Consultation Time',
            'Message',
            'Status',
            'Created At',
        ];
    }

    public function map($submission): array
    {
        return [
            $submission->id,
            $submission->name,
            $submission->email,
            $submission->phone ?? '',
            $submission->contact_method,
            $submission->online_consultation ? 'Yes' : 'No',
            $submission->consultation_date ? $submission->consultation_date->format('Y-m-d') : '',
            $submission->consultation_time ?? '',
            $submission->message,
            $submission->status ?? 'pending',
            $submission->created_at->format('Y-m-d H:i:s'),
        ];
    }
}

