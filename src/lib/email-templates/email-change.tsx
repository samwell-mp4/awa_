import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { BrandHeader, BrandFooter, styles } from './_brand'

interface EmailChangeEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  newEmail?: string
}

export const EmailChangeEmail = ({ confirmationUrl, newEmail }: EmailChangeEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme a alteração de email — Awã Tech</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Confirme seu novo email</Heading>
        <Text style={styles.text}>
          Você pediu para alterar seu email{newEmail ? ` para ${newEmail}` : ''}. Confirme clicando abaixo:
        </Text>
        <div style={styles.buttonWrap}>
          <Button style={styles.button} href={confirmationUrl}>Confirmar Alteração</Button>
        </div>
        <Text style={styles.footer}>Se não foi você, ignore este email.</Text>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
