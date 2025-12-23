import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Send, Clock, CheckCircle, HelpCircle, X } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import styles from './Support.module.css'

const faqs = [
    { q: 'How do I pay my bill online?', a: 'You can pay through the Billing section using any major credit card or bank transfer.' },
    { q: 'When is my water delivered?', a: 'Deliveries are made based on your subscription schedule. Check your dashboard for delivery dates.' },
    { q: 'How do I change my delivery address?', a: 'Contact our support team or update your profile in the app settings.' },
]

function Support() {
    const [newTicketOpen, setNewTicketOpen] = useState(false)
    const [formData, setFormData] = useState({ subject: '', message: '' })
    const [expandedFaq, setExpandedFaq] = useState(null)

    const customers = useDataStore(state => state.customers)
    const tickets = useDataStore(state => state.supportTickets)
    const addTicket = useDataStore(state => state.addTicket)

    // Simulate logged-in customer
    const currentCustomer = customers.find(c => c.status === 'active') || customers[0]
    const customerTickets = tickets.filter(t => t.customerId === currentCustomer?.id)

    const handleSubmit = (e) => {
        e.preventDefault()
        addTicket({
            customerId: currentCustomer?.id,
            subject: formData.subject,
            message: formData.message,
        })
        setNewTicketOpen(false)
        setFormData({ subject: '', message: '' })
    }

    return (
        <div className={styles.support}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerIcon}>
                    <HelpCircle size={32} />
                </div>
                <h1 className={styles.headerTitle}>How can we help?</h1>
                <p className={styles.headerSubtitle}>Get support for your water service</p>
            </div>

            {/* New Ticket Button */}
            <Button
                variant="primary"
                fullWidth
                icon={MessageCircle}
                onClick={() => setNewTicketOpen(!newTicketOpen)}
            >
                {newTicketOpen ? 'Cancel' : 'Create New Ticket'}
            </Button>

            {/* New Ticket Form */}
            {newTicketOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <GlassCard className={styles.formCard}>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Subject</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Brief description of your issue"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Message</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Describe your issue in detail..."
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                />
                            </div>
                            <Button type="submit" variant="primary" fullWidth icon={Send}>
                                Submit Ticket
                            </Button>
                        </form>
                    </GlassCard>
                </motion.div>
            )}

            {/* Previous Tickets */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Your Tickets ({customerTickets.length})</h3>

                <div className={styles.ticketsList}>
                    {customerTickets.length === 0 ? (
                        <GlassCard className={styles.emptyState}>
                            <p>No support tickets yet. Create one if you need help!</p>
                        </GlassCard>
                    ) : (
                        customerTickets.map((ticket, index) => (
                            <motion.div
                                key={ticket.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <GlassCard className={styles.ticketCard}>
                                    <div className={styles.ticketHeader}>
                                        <span className={styles.ticketId}>{ticket.id}</span>
                                        <div className={`${styles.ticketStatus} ${styles[ticket.status]}`}>
                                            {ticket.status === 'resolved' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                            {ticket.status === 'resolved' ? 'Resolved' : ticket.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                        </div>
                                    </div>
                                    <h4 className={styles.ticketSubject}>{ticket.subject}</h4>
                                    <p className={styles.ticketMessage}>{ticket.message}</p>
                                    {ticket.adminReply && (
                                        <div className={styles.adminReply}>
                                            <strong>Admin Reply:</strong>
                                            <p>{ticket.adminReply}</p>
                                        </div>
                                    )}
                                    <div className={styles.ticketMeta}>
                                        <span>Created: {ticket.createdAt}</span>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* FAQs */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Frequently Asked Questions</h3>
                <div className={styles.faqList}>
                    {faqs.map((faq, index) => (
                        <GlassCard
                            key={index}
                            className={styles.faqCard}
                            onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        >
                            <div className={styles.faqQuestion}>
                                <span>{faq.q}</span>
                                <motion.span
                                    animate={{ rotate: expandedFaq === index ? 45 : 0 }}
                                    className={styles.faqIcon}
                                >
                                    +
                                </motion.span>
                            </div>
                            {expandedFaq === index && (
                                <motion.p
                                    className={styles.faqAnswer}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    {faq.a}
                                </motion.p>
                            )}
                        </GlassCard>
                    ))}
                </div>
            </div>

            {/* Contact Info */}
            <GlassCard className={styles.contactCard}>
                <h3 className={styles.sectionTitle}>Need immediate help?</h3>
                <p className={styles.contactText}>
                    Call us at <strong>0800-WATER</strong> or email <strong>support@devinewater.pk</strong>
                </p>
            </GlassCard>
        </div>
    )
}

export default Support
