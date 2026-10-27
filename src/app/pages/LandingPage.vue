<script setup>
import LandingFeatures from './landing/LandingFeatures.vue'
import LandingFinale from './landing/LandingFinale.vue'
import LandingHero from './landing/LandingHero.vue'
import LandingJourney from './landing/LandingJourney.vue'
import LandingNumbers from './landing/LandingNumbers.vue'
import LandingRoles from './landing/LandingRoles.vue'
import LandingStatement from './landing/LandingStatement.vue'
</script>

<!-- Public landing page. The sign-in button arrives with P-16 (web login). -->
<template>
  <div>
    <LandingHero />
    <LandingStatement />
    <LandingJourney />
    <LandingFeatures />
    <LandingNumbers />
    <LandingRoles />
    <LandingFinale />
  </div>
</template>
