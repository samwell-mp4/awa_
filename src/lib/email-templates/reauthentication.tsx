import * as React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { BrandHeader, BrandFooter, styles } from './_brand'

interface ReauthenticationEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação Awã Tech</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Código de verificação</Heading>
        <Text style={styles.text}>Use o código abaixo para confirmar sua identidade:</Text>
        <Text style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '6px', textAlign: 'center', color: '#0f5132', margin: '24px 0' }}>
          {token}
        </Text>
        <Text style={styles.footer}>Se você não solicitou este código, ignore este email.</Text>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
