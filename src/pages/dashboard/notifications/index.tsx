import styles from "./DashboardNotifications.module.css";

const DashboardNotifications = () => {
    return (
        <div className={styles.root}>
            <section className={styles.panel}>
                <h1 className={styles.title}>Уведомления</h1>
                <p className={styles.text}>
                    В этом разделе в будущем появятся уведомления и полезные напоминания.
                </p>
            </section>
        </div>
    );
};

export default DashboardNotifications;
