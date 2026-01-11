/**
 * POST /api/reservations/:id/cancel
 * Cancel a reservation (customer only)
 */
router.post('/:id/cancel', authenticate, requireCustomer, (req, res) => {
    const { id } = req.params;

    try {
        const result = db.transaction(() => {
            // 1. Get reservation
            const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);

            if (!reservation) {
                throw new Error('Réservation introuvable');
            }

            // 2. Verify ownership
            if (reservation.user_id !== req.user.userId) {
                throw new Error('Non autorisé');
            }

            // 3. Verify status
            if (reservation.status !== 'pending') {
                throw new Error('Seules les réservations en attente peuvent être annulées');
            }

            // 4. Update reservation status
            db.prepare("UPDATE reservations SET status = 'cancelled' WHERE id = ?").run(id);

            // 5. Restore basket quantity
            // We increment the quantity even if visible is 0, and if it becomes > 0 we set visible = 1
            db.prepare(`
                    UPDATE baskets 
                    SET visible = CASE WHEN (quantity > 0) THEN 1 ELSE visible END 
                    WHERE id = ?
                `).run(reservation.basket_id);

            return { message: 'Réservation annulée' };
        })();

        res.json(result);
    } catch (error) {
        console.error('Cancel reservation error:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de l\'annulation' });
    }
});
