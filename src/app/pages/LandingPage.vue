<script setup>
import LandingFaq from './landing/LandingFaq.vue'
import LandingFeatures from './landing/LandingFeatures.vue'
import LandingFinale from './landing/LandingFinale.vue'
import LandingHero from './landing/LandingHero.vue'
import LandingJourney from './landing/LandingJourney.vue'
import LandingNav from './landing/LandingNav.vue'
import LandingProblem from './landing/LandingProblem.vue'
import LandingRoles from './landing/LandingRoles.vue'
import LandingSecurity from './landing/LandingSecurity.vue'
import LandingStatement from './landing/LandingStatement.vue'
import LandingSystems from './landing/LandingSystems.vue'
</script>

<!-- Public landing page; its content follows the project's Master Context. The sign-in button arrives with P-16 (web login). -->
<template>
  <div>
    <LandingNav />
    <LandingHero />
    <LandingStatement />
    <LandingProblem />
    <LandingJourney />
    <LandingFeatures />
    <LandingSystems />
    <LandingSecurity />
    <LandingRoles />
    <LandingFaq />
    <LandingFinale />
  </div>
</template>
