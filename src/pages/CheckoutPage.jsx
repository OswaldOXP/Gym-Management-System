import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css';
import { useGymData } from '../context/GymDataContext'
import { useAuth } from '../context/AuthContext'
import { AppleIcon, MobileIcon, BagIcon, CardIcon, ShieldIcon, CalendarIcon } from '../components/ModernIcons'

function luhnValid(number) {
  const digits = String(number).replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let shouldDouble = false
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i])
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

function expiryValid(expiry) {
  const match = String(expiry).match(/^(0[1-9]|1[0-2])\/(\d{2})$/)
  if (!match) return false
  const month = Number(match[1])
  const year = Number(`20${match[2]}`)
  const now = new Date()
  const expiryDate = new Date(year, month)
  return expiryDate > now
}

const WALLET_OPTIONS = [
  {
    id: 'apple-pay',
    label: 'Apple Pay',
    icon: <AppleIcon />,
    description: 'Use Face ID or Touch ID for a quick secure checkout.',
  },
  {
    id: 'google-pay',
    label: 'Google Pay',
    icon: <MobileIcon />,
    description: 'Pay with your saved Google wallet in one tap.',
  },
  {
    id: 'samsung-pay',
    label: 'Samsung Pay',
    icon: <MobileIcon />,
    description: 'Pay instantly with a verified Samsung wallet session.',
  },
  {
    id: 'tabby',
    label: 'Tabby',
    icon: <BagIcon />,
    description: 'Split your payment into installments with Tabby.',
  },
  {
    id: 'tamara',
    label: 'Tamara',
    icon: <BagIcon />,
    description: 'Pay later or split your checkout with Tamara installments.',
  },
]

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { pendingBooking, pendingPlanPurchase, confirmBooking, confirmPlanPurchase } = useGymData()
  const { user } = useAuth()
  const [checkoutPayload, setCheckoutPayload] = useState(null);
  const [checkoutType, setCheckoutType] = useState(null)
  const [confirmed, setConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [walletProvider, setWalletProvider] = useState('samsung-pay');
  const [form, setForm] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' })
  const [walletForm, setWalletForm] = useState({ email: '', phone: '', pin: '', installments: '4', acceptTerms: false })
  const [error, setError] = useState('')

  useEffect(() => {
    if (pendingBooking) {
      setCheckoutType('booking')
      setCheckoutPayload(pendingBooking);
    } else if (pendingPlanPurchase) {
      setCheckoutType('plan')
      setCheckoutPayload(pendingPlanPurchase)
    } else {
      navigate('/booking');
    }
  }, [navigate, pendingBooking, pendingPlanPurchase]);

  const validateCard = () => {
    const cardNumber = form.cardNumber.replace(/\s/g, '')
    if (!luhnValid(cardNumber)) return 'Enter a valid card number.'
    if (!expiryValid(form.expiry)) return 'Enter a valid expiry date (MM/YY).' 
    if (!/^\d{3,4}$/.test(form.cvv)) return 'Enter a valid CVV.'
    if (!form.name.trim() || form.name.trim().length < 3) return 'Enter cardholder name.'
    return ''
  }

  const validateDigitalWallet = () => {
    if (walletProvider === 'apple-pay' || walletProvider === 'google-pay') {
      return ''
    }

    if (walletProvider === 'samsung-pay') {
      if (!/^\S+@\S+\.\S+$/.test(walletForm.email.trim())) return 'Enter a valid Samsung account email.'
      if (!/^\d{6}$/.test(walletForm.pin)) return 'Enter the 6-digit Samsung Pay verification PIN.'
      return ''
    }

    if (walletProvider === 'tabby' || walletProvider === 'tamara') {
      if (!/^\S+@\S+\.\S+$/.test(walletForm.email.trim())) return `Enter a valid ${walletProvider === 'tamara' ? 'Tamara' : 'Tabby'} email.`
      if (!/^\+?[\d\s-]{8,}$/.test(walletForm.phone.trim())) return `Enter a valid mobile number for ${walletProvider === 'tamara' ? 'Tamara' : 'Tabby'}.`
      if (!['4', '12'].includes(walletForm.installments)) return `Choose a valid ${walletProvider === 'tamara' ? 'Tamara' : 'Tabby'} installment plan.`
      if (!walletForm.acceptTerms) return `Accept ${walletProvider === 'tamara' ? 'Tamara' : 'Tabby'} installment terms to continue.`
      return ''
    }

    return 'Choose a digital wallet option.'
  }

  const selectedWallet = WALLET_OPTIONS.find(option => option.id === walletProvider)

  const handleConfirm = async () => {
    setError('')
    if (paymentMethod === 'card') {
      const validationError = validateCard()
      if (validationError) {
        setError(validationError)
        return
      }
    } else {
      const validationError = validateDigitalWallet()
      if (validationError) {
        setError(validationError)
        return
      }
    }

    const result = checkoutType === 'plan'
      ? await confirmPlanPurchase({ memberName: user?.name, paymentMethod, walletProvider })
      : await confirmBooking({ memberName: user?.name, paymentMethod, walletProvider })

    if (!result.success) {
      setError(result.error)
      return;
    }
    setConfirmed(true);
  };

  if (!checkoutPayload) {
    return (
      <div className="checkout-page">
        <div className="checkout-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <p style={{ color: '#fff' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-card">
          <div className="confirmation-icon">✓</div>
          <h1>Payment Confirmed!</h1>
          <p>{checkoutType === 'plan' ? 'Your subscription has been activated successfully.' : 'Your training session has been successfully booked.'}</p>
          <div className="confirmation-details">
            {checkoutType === 'plan' ? (
              <>
                <p><strong>Plan:</strong> {checkoutPayload.name}</p>
                <p><strong>Duration:</strong> {checkoutPayload.period}</p>
                <p><strong>Payment Method:</strong> {selectedWallet?.label || 'Card'}</p>
                <p><strong>Total Paid:</strong> AED {Math.round(checkoutPayload.price)}</p>
              </>
            ) : (
              <>
                <p><strong>Trainer:</strong> {checkoutPayload.trainer.name}</p>
                <p><strong>Time:</strong> {checkoutPayload.timeSlot}</p>
                <p><strong>Session Type:</strong> {checkoutPayload.sessionType === 'single' ? 'Single Session' : '4-Session Package'}</p>
                <p><strong>Payment Method:</strong> {selectedWallet?.label || 'Card'}</p>
                <p><strong>Total Paid:</strong> AED {Math.round(checkoutPayload.totalPrice)}</p>
              </>
            )}
          </div>
          <p className="confirmation-note">A confirmation email has been sent to your registered email.</p>
          <button className="dashboard-btn" onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const subtotal = checkoutType === 'plan' ? checkoutPayload.price : checkoutPayload.totalPrice;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <button className="back-btn" onClick={() => navigate(checkoutType === 'plan' ? '/plans' : '/booking')}>
          ← Back to {checkoutType === 'plan' ? 'Plans' : 'Booking'}
        </button>
        
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>{checkoutType === 'plan' ? 'Complete your plan purchase' : 'Complete your booking'}</p>
        </div>
        
        <div className="checkout-grid">
          {/* Payment Section */}
          <div className="payment-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><CardIcon size={20} /> Payment Details</h3>
            
            <div className="payment-methods">
              <div 
                className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`} 
                onClick={() => setPaymentMethod('card')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><CardIcon size={18} /> Credit / Debit Card</span>
              </div>
              <div 
                className={`payment-option ${paymentMethod === 'digital' ? 'selected' : ''}`} 
                onClick={() => setPaymentMethod('digital')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><MobileIcon size={18} /> Digital Wallet</span>
              </div>
            </div>
            
            {paymentMethod === 'card' && (
              <>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={form.cardNumber}
                    onChange={e => setForm(current => ({ ...current, cardNumber: e.target.value.replace(/[^\d\s]/g, '').slice(0, 23) }))}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={form.expiry}
                      onChange={e => setForm(current => ({ ...current, expiry: e.target.value.replace(/[^\d/]/g, '').slice(0, 5) }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      placeholder="123"
                      value={form.cvv}
                      onChange={e => setForm(current => ({ ...current, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={e => setForm(current => ({ ...current, name: e.target.value }))}
                  />
                </div>
              </>
            )}

            {error && <p style={{ color: 'var(--danger)', marginTop: 8, fontSize: '0.9rem' }}>{error}</p>}
            
            {paymentMethod === 'digital' && (
              <div className="digital-wallets">
                <div className="wallet-grid">
                  {WALLET_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      className={`wallet-btn ${option.id} ${walletProvider === option.id ? 'selected' : ''}`}
                      onClick={() => setWalletProvider(option.id)}
                    >
                      <span className="wallet-icon">{option.icon}</span>
                      <span className="wallet-title">{option.label}</span>
                      <span className="wallet-copy">{option.description}</span>
                    </button>
                  ))}
                </div>

                {walletProvider === 'samsung-pay' && (
                  <>
                    <div className="form-group">
                      <label>Samsung Account Email</label>
                      <input
                        type="email"
                        placeholder="name@samsung.com"
                        value={walletForm.email}
                        onChange={e => setWalletForm(current => ({ ...current, email: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Verification PIN</label>
                      <input
                        type="password"
                        placeholder="6-digit PIN"
                        value={walletForm.pin}
                        onChange={e => setWalletForm(current => ({ ...current, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                      />
                    </div>
                  </>
                )}

                {(walletProvider === 'tabby' || walletProvider === 'tamara') && (
                  <>
                    <div className="form-group">
                      <label>{walletProvider === 'tamara' ? 'Tamara Email' : 'Tabby Email'}</label>
                      <input
                        type="email"
                        placeholder="name@email.com"
                        value={walletForm.email}
                        onChange={e => setWalletForm(current => ({ ...current, email: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input
                        type="tel"
                        placeholder="+971 50 123 4567"
                        value={walletForm.phone}
                        onChange={e => setWalletForm(current => ({ ...current, phone: e.target.value }))}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Installment Plan</label>
                        <select
                          value={walletForm.installments}
                          onChange={e => setWalletForm(current => ({ ...current, installments: e.target.value }))}
                        >
                          <option value="4">4 payments</option>
                          <option value="12">12 payments</option>
                        </select>
                      </div>
                      <div className="form-group wallet-terms">
                        <label>
                          <input
                            type="checkbox"
                            checked={walletForm.acceptTerms}
                            onChange={e => setWalletForm(current => ({ ...current, acceptTerms: e.target.checked }))}
                          />
                          <span>I agree to {walletProvider === 'tamara' ? 'Tamara' : 'Tabby'} installment terms.</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {paymentMethod === 'digital' && selectedWallet && (
              <div className="wallet-summary">
                <strong>{selectedWallet.label}</strong>
                <span>{selectedWallet.description}</span>
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="order-summary">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><CalendarIcon size={20} /> Order Summary</h3>
            
            <div className="summary-details">
              {checkoutType === 'plan' ? (
                <>
                  <p><strong>Plan:</strong> {checkoutPayload.name}</p>
                  <p><strong>Billing Cycle:</strong> {checkoutPayload.period}</p>
                </>
              ) : (
                <>
                  <p><strong>Trainer:</strong> {checkoutPayload.trainer.name}</p>
                  <p><strong>Specialty:</strong> {checkoutPayload.trainer.specialty}</p>
                  <p><strong>Time Slot:</strong> {checkoutPayload.timeSlot}</p>
                  <p><strong>Session Type:</strong> {checkoutPayload.sessionType === 'single' ? 'Single Session' : '4-Session Package'}</p>
                </>
              )}
            </div>
            
            <div className="price-summary">
              <div className="price-row">
                <span>Subtotal:</span>
                <span>AED {subtotal}</span>
              </div>
              <div className="price-row">
                <span>Tax (5%):</span>
                <span>AED {tax}</span>
              </div>
              <div className="price-row total">
                <span>Total:</span>
                <span>AED {total}</span>
              </div>
            </div>
            
            <button className="confirm-btn" onClick={handleConfirm}>
              Confirm & Pay {paymentMethod === 'digital' ? `with ${selectedWallet?.label || 'Wallet'}` : 'by Card'}
            </button>
            <p className="secure-note" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><ShieldIcon size={16} /> Secure payment processed by IronCore Gym</p>
          </div>
        </div>
      </div>
    </div>
  );
}