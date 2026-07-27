import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { BrandHeader, BrandFooter, styles } from './_brand'

interface MagicLinkEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  magicLinkUrl: string
}

export const MagicLinkEmail = ({ magicLinkUrl }: MagicLinkEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu link de acesso ao Awã Tech</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Entrar no Awã Tech</Heading>
        <Text style={styles.text}>Clique no botão abaixo para entrar na sua conta:</Text>
        <div style={styles.buttonWrap}>
          <Button style={styles.button} href={magicLinkUrl}>Entrar</Button>
        </div>
        <Text style={styles.footer}>Se você não solicitou este link, pode ignorar este email.</Text>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
