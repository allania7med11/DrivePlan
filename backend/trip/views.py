from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import TripInputSerializer
from .services import TripPlanner

class PlanTripAPIView(APIView):
    def post(self, request):
        serializer = TripInputSerializer(data=request.data)
        if serializer.is_valid():
            planner = TripPlanner(
                current_location=serializer.validated_data['current_location'],
                pickup_location=serializer.validated_data['pickup_location'],
                dropoff_location=serializer.validated_data['dropoff_location'],
                cycle_used_hours=serializer.validated_data['cycle_used_hours'],
            )
            plan = planner.plan_trip()
            return Response(plan, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

