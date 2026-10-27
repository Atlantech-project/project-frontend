<script setup>
import LandingFaq from './landing/LandingFaq.vue'
import LandingFeatures from './landing/LandingFeatures.vue'
import LandingFinale from './landing/LandingFinale.vue'
import LandingHero from './landing/LandingHero.vue'
import LandingJourney from './landing/LandingJourney.vue'
import LandingNav from './landing/LandingNav.vue'
import LandingRoles from './landing/LandingRoles.vue'
import LandingStatement from './landing/LandingStatement.vue'
</script>

<!-- Public landing page. The sign-in button arrives with P-16 (web login). -->
<template>
  <div>
    <LandingNav />
    <LandingHero />
    <LandingStatement />
    <LandingJourney />
    <LandingFeatures />
    <LandingRoles />
    <LandingFaq />
    <LandingFinale />
  </div>
</template>
