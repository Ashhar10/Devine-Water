import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Droplets, Mail, Lock, LogIn } from 'lucide-react'
import { loginUser } from '../../lib/supabaseService'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import styles from './Login.module.css'

function Login() {
    const navigate = useNavigate()
    const setCurrentUser = useDataStore(state => state.setCurrentUser)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Login against users table in database
            const user = await loginUser(email, password)

            if (user) {
                setCurrentUser(user)

                // Route based on role
                if (user.role === 'customer') {
                    navigate('/customer')
                } else {
                    navigate('/admin')
                }
            } else {
                setError('Invalid email or password')
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.background}>
                <div className={styles.gradient1} />
                <div className={styles.gradient2} />
            </div>

            <motion.div
                className={styles.loginBox}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <GlassCard className={styles.card} glow glowColor="cyan">
                    {/* Logo */}
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <Droplets size={32} />
                        </div>
                        <h1 className={styles.logoText}>Devine Water</h1>
                    </div>

                    <p className={styles.subtitle}>Sign in to your account</p>

                    {error && (
                        <motion.div
                            className={styles.error}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            icon={LogIn}
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <p className={styles.helpText}>
                        Contact your administrator if you don't have an account
                    </p>
                </GlassCard>
            </motion.div>
        </div>
    )
}

export default Login
