// PostgreSQL raw query model — ORM ব্যবহার না করে
// কারণ: project এ Sequelize/Prisma setup নেই, raw pg pool ব্যবহার হচ্ছে

const { pool } = require("../config/db");

const AlertSubscription = {
    // User এর সব subscriptions আনো
    async findByUser(userId) {
        const result = await pool.query(
            `SELECT s.*, r.name as route_name 
       FROM alert_subscriptions s
       LEFT JOIN routes r ON s.route_id = r.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
            [userId],
        );
        return result.rows;
    },

    // নতুন subscription তৈরি করো
    async create({
        userId,
        routeId,
        tripId,
        notifyDelay,
        notifyCancellation,
        notifyCongestion,
    }) {
        // duplicate check — একই route এ দুইবার subscribe করতে দেবো না
        const existing = await pool.query(
            `SELECT id FROM alert_subscriptions 
       WHERE user_id = $1 AND route_id = $2`,
            [userId, routeId],
        );
        if (existing.rows.length > 0) {
            throw new Error("Already subscribed to this route");
        }

        const result = await pool.query(
            `INSERT INTO alert_subscriptions 
       (user_id, route_id, trip_id, notify_delay, notify_cancellation, notify_congestion)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                userId,
                routeId,
                tripId || null,
                notifyDelay,
                notifyCancellation,
                notifyCongestion,
            ],
        );
        return result.rows[0];
    },

    // Subscription delete করো (unsubscribe)
    async delete(subscriptionId, userId) {
        // userId check করছি — অন্য user এর subscription delete করা ঠেকাতে
        const result = await pool.query(
            `DELETE FROM alert_subscriptions 
       WHERE id = $1 AND user_id = $2 RETURNING *`,
            [subscriptionId, userId],
        );
        return result.rows[0];
    },

    // Preference update (কোন ধরনের alert চাই)
    async updatePreferences(
        subscriptionId,
        userId,
        { notifyDelay, notifyCancellation, notifyCongestion },
    ) {
        const result = await pool.query(
            `UPDATE alert_subscriptions 
       SET notify_delay = $1, notify_cancellation = $2, notify_congestion = $3
       WHERE id = $4 AND user_id = $5 RETURNING *`,
            [
                notifyDelay,
                notifyCancellation,
                notifyCongestion,
                subscriptionId,
                userId,
            ],
        );
        return result.rows[0];
    },
};

module.exports = AlertSubscription;
