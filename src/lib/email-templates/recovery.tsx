import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { BrandHeader, BrandFooter, styles } from './_brand'

interface RecoveryEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  recoveryUrl: string
}

export const RecoveryEmail = ({ recoveryUrl }: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Redefinir senha do Awã Tech</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Redefinir sua senha</Heading>
        <Text style={styles.text}>Recebemos um pedido para redefinir sua senha. Clique no botão abaixo para criar uma nova:</Text>
        <div style={styles.buttonWrap}>
          <Button style={styles.button} href={recoveryUrl}>Redefinir Senha</Button>
        </div>
        <Text style={styles.footer}>Se você não solicitou isto, ignore este email.</Text>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
