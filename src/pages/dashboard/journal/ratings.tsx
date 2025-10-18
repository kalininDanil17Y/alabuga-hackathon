import styles from "../notifications/DashboardNotifications.module.css";

const DashboardJournalRatings = () => (
    <div className={styles.root}>
        <section className={styles.panel}>
            <h1 className={styles.title}>Рейтинг</h1>
            <p className={styles.text}>
                К сожалению рейтинг ещё не готов, но заходите позже.
            </p>
        </section>
    </div>
);

export default DashboardJournalRatings;
