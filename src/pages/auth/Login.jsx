import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Droplets, User, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import { loginUser } from '../../lib/supabaseService'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import styles from './Login.module.css'

function Login() {
    const navigate = useNavigate()
    const setCurrentUser = useDataStore(state => state.setCurrentUser)

    const [identifier, setIdentifier] = useState('') // Can be email or phone
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Login with email or phone
            const user = await loginUser(identifier, password)

            if (user) {
                setCurrentUser(user)

                // Route based on role
                if (user.role === 'customer') {
                    navigate('/customer')
                } else {
                    navigate('/admin')
                }
            } else {
                setError('Invalid credentials. Please check your email/phone and password.')
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
                            <User size={18} className={styles.inputIcon} />
                            <input
                                type="text"
                                placeholder="Email or Phone Number"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${styles.input} ${styles.passwordInput}`}
                                required
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
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
