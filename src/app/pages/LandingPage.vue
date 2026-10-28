<script setup>
import LandingContact from './landing/LandingContact.vue'
import LandingFaq from './landing/LandingFaq.vue'
import LandingFeatures from './landing/LandingFeatures.vue'
import LandingFinale from './landing/LandingFinale.vue'
import LandingHero from './landing/LandingHero.vue'
import LandingJourney from './landing/LandingJourney.vue'
import LandingNav from './landing/LandingNav.vue'
import LandingRoles from './landing/LandingRoles.vue'
import LandingSecurity from './landing/LandingSecurity.vue'
import LandingStatement from './landing/LandingStatement.vue'
import LandingSystems from './landing/LandingSystems.vue'
import { useSmoothScroll } from './landing/smoothScroll'
import './landing/glass.css'
import './landing/reveal.css'

useSmoothScroll()
</script>

<!-- Public landing page; its content follows the project's Master Context. -->
<template>
  <div>
    <LandingNav />
    <LandingHero />
    <LandingStatement />
    <LandingJourney />
    <LandingFeatures />
    <LandingSystems />
    <LandingSecurity />
    <LandingRoles />
    <LandingFaq />
    <LandingContact />
    <LandingFinale />
  </div>
</template>
