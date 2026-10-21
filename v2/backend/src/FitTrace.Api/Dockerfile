FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY src/FitTrace.Core/FitTrace.Core.csproj src/FitTrace.Core/
COPY src/FitTrace.Data/FitTrace.Data.csproj src/FitTrace.Data/
COPY src/FitTrace.Api/FitTrace.Api.csproj src/FitTrace.Api/

RUN dotnet restore src/FitTrace.Api/FitTrace.Api.csproj

COPY src/ src/
WORKDIR /src/src/FitTrace.Api
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "FitTrace.Api.dll"]
