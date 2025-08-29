# GIS-Based Protest Management System

## Project Overview

This project implements advanced spatial analysis techniques within Geographic Information Systems (GIS) to enhance the management and response strategies for protest events. The system leverages geospatial technologies to analyze protest patterns, predict potential hotspots, optimize resource allocation, and facilitate real-time monitoring of crowd dynamics.

## Features

### Core Functionality
- **Spatial Analysis**: Hotspot analysis, density mapping, and temporal-spatial clustering
- **Predictive Analytics**: Identification of high-risk areas based on historical data
- **Real-time Monitoring**: Live tracking of crowd dynamics and movement patterns
- **Resource Optimization**: Efficient deployment of security and emergency services
- **Risk Assessment**: Comprehensive evaluation of potential conflict zones
- **Network Analysis**: Optimal patrol route planning and emergency response paths

### Technical Capabilities
- Interactive GIS mapping interface
- Historical protest data analysis
- Demographic and socioeconomic data integration
- Transportation network analysis
- Buffer zone creation around critical infrastructure
- Real-time data feeds integration
- Comprehensive reporting and visualization

## Technology Stack

### Frontend
- [Specify your frontend technologies, e.g., React, Angular, Vue.js]
- Mapping libraries (Leaflet, Mapbox, ArcGIS API)
- Data visualization tools
- Responsive web design

### Backend
- [Specify your backend technologies, e.g., Node.js, Python Flask/Django, Java Spring]
- Spatial database (PostGIS, MongoDB with geospatial support)
- GIS processing libraries
- API development framework

### Database
- PostgreSQL with PostGIS extension
- Spatial data storage and indexing
- Historical protest event records
- Geographic boundary data

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- PostgreSQL with PostGIS extension
- Git

### Clone Repository
```bash
git clone https://github.com/yourusername/gis-protest-management.git
cd gis-protest-management
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Configure database connection in config file
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
pnpm install
pnpm run dev
```

### Database Configuration
1. Install PostgreSQL and PostGIS
2. Create database: `createdb protest_management`
3. Enable PostGIS: `psql -d protest_management -c "CREATE EXTENSION postgis;"`
4. Import initial spatial data and boundaries

## Usage

### Getting Started
1. Access the web application at `http://localhost:3000`
2. Login with administrator credentials
3. Import historical protest data
4. Configure spatial analysis parameters
5. Begin monitoring and analysis

### Key Workflows
1. **Data Import**: Upload historical protest events and geographic boundaries
2. **Hotspot Analysis**: Identify areas with high protest activity
3. **Predictive Modeling**: Generate risk assessments for upcoming events
4. **Resource Planning**: Optimize patrol routes and emergency response
5. **Real-time Monitoring**: Track live events and crowd movements
6. **Report Generation**: Create comprehensive analysis reports

## Project Structure

```
final-year/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/
│   ├── api/
│   ├── models/
│   ├── spatial/
│   ├── requirements.txt
│   └── ...
├── data/
│   ├── sample_data/
│   ├── shapefiles/
│   └── ...
├── docs/
│   ├── api_documentation.md
│   ├── user_guide.md
│   └── ...
└── README.md
```

## API Documentation

### Endpoints
- `GET /api/protests` - Retrieve protest events
- `POST /api/analysis/hotspot` - Perform hotspot analysis
- `GET /api/predictions` - Get risk predictions
- `POST /api/resources/optimize` - Optimize resource allocation
- `GET /api/realtime/events` - Real-time event stream

### Authentication
The API uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Data Sources

- Historical protest event records
- Census and demographic data
- Transportation network data
- Critical infrastructure locations
- Weather and environmental data
- Social media feeds (optional)

## Spatial Analysis Techniques

1. **Kernel Density Estimation**: Identify protest density patterns
2. **Hotspot Analysis (Getis-Ord Gi*)**: Statistical significance of clustering
3. **Network Analysis**: Optimal routing and accessibility
4. **Buffer Analysis**: Safety zones around critical areas
5. **Temporal Analysis**: Time-based pattern recognition
6. **Spatial Autocorrelation**: Geographic clustering analysis

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-analysis`)
3. Commit changes (`git commit -am 'Add new spatial analysis method'`)
4. Push to branch (`git push origin feature/new-analysis`)
5. Create Pull Request

## Testing

### Run Tests
```bash
# Backend tests
cd backend
python manage.py runserver 

# Frontend tests
cd frontend
pnpm run dev
```

## Deployment

### Production Setup
1. Configure environment variables
2. Set up production database
3. Build frontend assets: `npm run build`
4. Deploy to cloud platform (AWS, Azure, GCP)
5. Configure web server (Nginx, Apache)

## Security Considerations

- Secure API endpoints with proper authentication
- Implement role-based access control
- Encrypt sensitive data
- Regular security audits
- Compliance with data protection regulations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Academic supervisors and advisors
- GIS and spatial analysis community
- Open source mapping libraries
- Data providers and government agencies

## Contact

- **Author**: Dennis Githinji Mwangi
- **Email**: mwangi.dennis21@students.dkut.ac.ke
- **Institution**: Dedan Kimathi University Of Technology
- **Department**: Geomatics Eng and Geospatial Information systems

## Version History

- **v1.0.0** - Initial release with basic spatial analysis
- **v1.1.0** - Added predictive modeling capabilities
- **v1.2.0** - Real-time monitoring integration
- **v2.0.0** - Enhanced user interface and API improvements

## Future Enhancements

- Machine learning integration for improved predictions
- Mobile application development
- Advanced visualization techniques
- Integration with emergency response systems
- Multi-language support
- Enhanced real-time processing capabilities

---

For detailed documentation, please refer to the `docs/` directory.
