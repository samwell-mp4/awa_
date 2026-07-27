import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { BrandHeader, BrandFooter, styles } from './_brand'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  inviteUrl: string
}

export const InviteEmail = ({ inviteUrl }: InviteEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Você foi convidado para o Awã Tech</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Heading style={styles.h1}>Você foi convidado!</Heading>
        <Text style={styles.text}>Aceite o convite para entrar no Awã Tech e explorar a cultura Pataxó:</Text>
        <div style={styles.buttonWrap}>
          <Button style={styles.button} href={inviteUrl}>Aceitar Convite</Button>
        </div>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
