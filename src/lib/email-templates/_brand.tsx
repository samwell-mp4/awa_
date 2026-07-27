import * as React from 'react'
import { Container, Img, Link, Section, Text } from '@react-email/components'

export const LOGO_URL =
  'https://awa-tech.store/__l5e/assets-v1/b63a81e3-e91b-4e41-8110-ee8404ec59b9/adulto-logo.png'
export const SITE_URL = 'https://awa-tech.store'
export const BRAND = '#0f5132'
export const BRAND_ACCENT = '#c9a227'

export const BrandHeader = () => (
  <Section style={{ textAlign: 'center' as const, padding: '24px 0 8px' }}>
    <Img
      src={LOGO_URL}
      alt="Awã Tech"
      width="120"
      height="120"
      style={{ margin: '0 auto', borderRadius: '16px' }}
    />
  </Section>
)

export const BrandFooter = () => (
  <Section style={{ borderTop: '1px solid #eee', marginTop: '32px', paddingTop: '16px' }}>
    <Text style={{ fontSize: '12px', color: '#888', textAlign: 'center' as const, margin: 0 }}>
      © {new Date().getFullYear()} Awã Tech —{' '}
      <Link href={SITE_URL} style={{ color: BRAND }}>
        awa-tech.store
      </Link>
    </Text>
  </Section>
)

export const styles = {
  main: { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' },
  container: { padding: '20px 25px', maxWidth: '560px' },
  h1: { fontSize: '22px', fontWeight: 'bold' as const, color: BRAND, margin: '0 0 20px', textAlign: 'center' as const },
  text: { fontSize: '15px', color: '#333', lineHeight: '1.6', margin: '0 0 20px' },
  link: { color: BRAND, textDecoration: 'underline' },
  button: {
    backgroundColor: BRAND,
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 'bold' as const,
    borderRadius: '10px',
    padding: '14px 24px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  buttonWrap: { textAlign: 'center' as const, margin: '24px 0' },
  footer: { fontSize: '12px', color: '#999999', margin: '20px 0 0', textAlign: 'center' as const },
}
