import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { BrandHeader, BrandFooter, styles } from './_brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ siteName, confirmationUrl }: SignupEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme seu email no {siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Bem-vindo ao Awã Tech</Heading>
        <Text style={styles.text}>
          Obrigado por criar sua conta! Para começar sua jornada pela cultura Pataxó, confirme seu email clicando no botão abaixo:
        </Text>
        <div style={styles.buttonWrap}>
          <Button style={styles.button} href={confirmationUrl}>Confirmar Email</Button>
        </div>
        <Text style={styles.footer}>Se você não criou esta conta, ignore este email.</Text>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
