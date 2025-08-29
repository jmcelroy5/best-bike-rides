import { useState, useEffect } from 'react'
import { apiClient } from '../util/apiClient'

import type { JSX } from 'react'
import type { BikeRoute } from '../types/bikeRoute'

import RouteCard from '../components/RouteCard'

function Home(): JSX.Element {
    const [routes, setRoutes] = useState<BikeRoute[]>([]);
    
    useEffect(() => {
        apiClient.get<BikeRoute[]>('/bike-routes').then((data) => {
            console.log({ data})
            setRoutes(data);
        });
    }, []);
    
    return (
        <div>
            {routes.map((route: BikeRoute) => <RouteCard route={route} />)}
        </div>
    )
  }

  export default Home;