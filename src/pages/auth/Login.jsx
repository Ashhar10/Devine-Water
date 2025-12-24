import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Droplets, Mail, Lock, LogIn, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useDataStore } from '../../store/dataStore'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import styles from './Login.module.css'

function Login() {
    const navigate = useNavigate()
    const setCurrentUser = useDataStore(state => state.setCurrentUser)

    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (supabase) {
                // Real Supabase authentication
                if (isLogin) {
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    })

                    if (error) throw error

                    setCurrentUser({
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.user_metadata?.name || email.split('@')[0],
                        role: data.user.user_metadata?.role || 'admin'
                    })
                } else {
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: { name, role: 'admin' }
                        }
                    })

                    if (error) throw error

                    setCurrentUser({
                        id: data.user.id,
                        email: data.user.email,
                        name: name,
                        role: 'admin'
                    })
                }
            } else {
                // Demo mode - no Supabase configured
                setCurrentUser({
                    id: 'demo-user',
                    email: email,
                    name: name || email.split('@')[0],
                    role: 'admin'
                })
            }

            navigate('/admin')
        } catch (err) {
            setError(err.message || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    // Quick demo login
    const handleDemoLogin = () => {
        setCurrentUser({
            id: 'demo-admin',
            email: 'admin@devinewater.pk',
            name: 'Admin User',
            role: 'admin'
        })
        navigate('/admin')
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

                    <p className={styles.subtitle}>
                        {isLogin ? 'Sign in to your account' : 'Create a new account'}
                    </p>

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
                        {!isLogin && (
                            <div className={styles.inputGroup}>
                                <User size={18} className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={styles.input}
                                    required={!isLogin}
                                />
                            </div>
                        )}

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
                                minLength={6}
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            icon={LogIn}
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                        </Button>
                    </form>

                    <div className={styles.divider}>
                        <span>or</span>
                    </div>

                    <Button
                        variant="ghost"
                        onClick={handleDemoLogin}
                        className={styles.demoBtn}
                    >
                        Continue as Demo Admin
                    </Button>

                    <p className={styles.toggleText}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className={styles.toggleBtn}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </GlassCard>
            </motion.div>
        </div>
    )
}

export default Login
