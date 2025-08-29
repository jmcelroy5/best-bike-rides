import type { BikeRoute } from '../../types/bikeRoute'
import styles from './index.module.css'

export default function RouteCard({ route }: { route: BikeRoute }) {
    return (
        <div className={styles.card}>
            <h2 className={styles.title}>{route.name}</h2>
            <p className={styles.description}>{route.description}</p>
        </div>
    )
}