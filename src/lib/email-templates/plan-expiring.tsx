import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section } from '@react-email/components'
import { BrandHeader, BrandFooter, styles, SITE_URL } from './_brand'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  planName?: string
  daysLeft?: number
  expiresOn?: string
  manageUrl?: string
}

const Email = ({ name, planName = 'Awã Tech', daysLeft = 7, expiresOn, manageUrl }: Props) => {
  const url = manageUrl || `${SITE_URL}/minha-conta`
  return (
    <Html lang="pt" dir="ltr">
      <Head />
      <Preview>{`Seu plano ${planName} vence em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <BrandHeader />
          <Heading style={styles.h1}>Seu plano está prestes a vencer</Heading>
          <Text style={styles.text}>
            Olá{name ? `, ${name}` : ''} 👋
          </Text>
          <Text style={styles.text}>
            Passando para avisar que sua assinatura <b>{planName}</b> vence
            {daysLeft === 0 ? ' hoje' : ` em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`}
            {expiresOn ? ` (${expiresOn})` : ''}. Para não perder o acesso ao conteúdo — dicionário, trilhas,
            Professor Akuã, cânticos e histórias — mantenha o pagamento em dia.
          </Text>
          <Section style={styles.buttonWrap}>
            <Button href={url} style={styles.button}>
              Gerenciar assinatura
            </Button>
          </Section>
          <Text style={styles.text}>
            Se o pagamento não for realizado, o acesso Premium será bloqueado automaticamente na data de vencimento.
          </Text>
          <Text style={{ ...styles.text, fontSize: '13px', color: '#666' }}>
            Alguma dúvida? Escreva para <a style={styles.link} href="mailto:duvidas@awa-tech.store">duvidas@awa-tech.store</a>.
          </Text>
          <BrandFooter />
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => {
    const d = typeof data?.daysLeft === 'number' ? data.daysLeft : 7
    const plan = data?.planName || 'Awã Tech'
    if (d <= 0) return `Seu plano ${plan} vence hoje`
    return `Seu plano ${plan} vence em ${d} ${d === 1 ? 'dia' : 'dias'}`
  },
  displayName: 'Aviso de vencimento de plano',
  previewData: { name: 'Aprendiz', planName: 'Adulto', daysLeft: 7, expiresOn: '30/07/2026' },
} satisfies TemplateEntry
