from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from .models import Course
from .serializers import CourseSerializer
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from io import BytesIO
from rest_framework.decorators import action
import datetime as import_datetime

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        queryset = Course.objects.all()
        # Get query parameters from the request
        search_query = self.request.query_params.get('search', '')
        if search_query:
            # Filter by course_code, course_name, or description
            queryset = queryset.filter(
                Q(course_code__icontains=search_query) |
                Q(course_name__icontains=search_query) |
                Q(description__icontains=search_query)
            )
        return queryset

    def create(self, request, *args, **kwargs):
        try:
            credits = float(request.data.get('credits'))
            if credits > 10:
                return Response({"error": "Credits cannot exceed 10."}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Credits must be a number."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            credits = float(request.data.get('credits'))
            if credits > 10:
                return Response({"error": "Credits cannot exceed 10."}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Credits must be a number."}, status=status.HTTP_400_BAD_REQUEST)

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='export-pdf')
    def export_pdf(self, request):
        # Get query parameters
        search_query = self.request.query_params.get('search', '')
        
        # Get courses (reusing the get_queryset method)
        courses = self.get_queryset()
        
        # Create a BytesIO buffer to receive the PDF data
        buffer = BytesIO()
        
        # Create the PDF object using the BytesIO buffer as its "file"
        try:
            # Create HTML content for PDF
            html_string = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Courses Report</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    h1 {
                        color: #333366;
                        border-bottom: 1px solid #cccccc;
                        padding-bottom: 10px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #dddddd;
                        text-align: left;
                        padding: 8px;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    .report-info {
                        margin-bottom: 20px;
                        font-size: 12px;
                        color: #666666;
                    }
                </style>
            </head>
            <body>
                <h1>Courses Report</h1>
                <div class="report-info">
                    <p>Generated on: """ + str(import_datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")) + """</p>
                    """ + (f"<p>Search filter: {search_query}</p>" if search_query else "") + """
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Credits</th>
                            <th>Status</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        """ + "".join([f"""
                        <tr>
                            <td>{course.course_code}</td>
                            <td>{course.course_name}</td>
                            <td>{course.credits}</td>
                            <td>{'Available' if course.status == 'available' else 'Not Available'}</td>
                            <td>{course.description or ''}</td>
                        </tr>
                        """ for course in courses]) + """
                    </tbody>
                </table>
            </body>
            </html>
            """
            
            # Convert HTML to PDF
            pisa_status = pisa.CreatePDF(html_string, dest=buffer)
            
            # If error creating PDF
            if pisa_status.err:
                return Response(
                    {"error": "Error generating PDF"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # FileResponse sets the Content-Disposition header so that browsers
            # present the option to save the file.
            buffer.seek(0)
            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="courses_report.pdf"'
            
            return response
        
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )