from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings 
from trip.services.map_client import InvalidAddressError, MapAPIError, MapClient
from trip.services.trip_planner import DutyLimitExceeded, TripPlanner

from .serializers import TripInputSerializer



class PlanTripAPIView(APIView):
    def post(self, request):
        serializer = TripInputSerializer(data=request.data)
        if serializer.is_valid():
            try:
                map_client = MapClient(api_key=settings.OPENROUTESERVICE_API_KEY)

                planner = TripPlanner(
                    current_location=serializer.validated_data['current_location'],
                    pickup_location=serializer.validated_data['pickup_location'],
                    dropoff_location=serializer.validated_data['dropoff_location'],
                    cycle_used_hours=serializer.validated_data['cycle_used_hours'],
                    map_client=map_client
                )

                # ✅ Generate trip plan
                plan = planner.plan_trip()
                return Response(plan, status=status.HTTP_200_OK)

            except InvalidAddressError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            except DutyLimitExceeded as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            except MapAPIError as e:
                return Response({"error": f"Map service error: {e}"}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
