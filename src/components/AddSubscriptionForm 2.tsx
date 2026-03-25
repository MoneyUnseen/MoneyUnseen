import { useState, useEffect } from 'react'
import type { BillingFrequency, SubscriptionCategory_All } from '../types'
import { isFixedCostCategory } from '../types'

interface AddSubscriptionFormProps {
  onAdd: (subscription: {
    name: string
    cost: number
    frequency: BillingFrequency
    category: SubscriptionCategory_All
    renewalDate: Date
    isTrial?: boolean
    trialEndsDate?: Date
    noticePeriod?: number
    isFixedCost?: boolean
  }) => void
  onCancel: () => void
}

// Auto-detect: keyword → { tab, category, cancelAnytime? }
type DetectResult = { tab: 'subscription' | 'fixed'; category: SubscriptionCategory_All; cancelAnytime?: boolean }

// Each entry: [keywords[], result]
// Keywords are matched with fuzzy tolerance (1 typo allowed for words 6+ chars)
const AUTO_DETECT_RULES: [string[], DetectResult][] = [
  // ── STREAMING ──────────────────────────────────────────────────
  [['netflix', 'netlix', 'netflic'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  [['disney', 'disnay', 'disnep'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  [['hbo', 'hbo max', 'hbomax'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  [['hulu'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  [['videoland', 'vidoland'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  [['prime video', 'amazon video'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  [['amazon prime'], { tab: 'subscription', category: 'webshop', cancelAnytime: true }],
  [['apple tv', 'appletv', 'apple tv+'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  [['peacock'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  [['youtube', 'youtub', 'you tube'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  [['paramount', 'paramout'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  [['discovery+', 'discovery plus', 'discoveryplus'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  [['crunchyroll', 'crunchroll'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  [['mubi'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  [['viaplay', 'via play'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  [['npo start', 'npostart'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  [['tvnederland', 'rtl+', 'rtl plus'], { tab: 'subscription', category: 'streaming', cancelAnytime: true }],
  // ── MUSIC ──────────────────────────────────────────────────────
  [['spotify', 'spotif', 'spotyfy'], { tab: 'subscription', category: 'music', cancelAnytime: true }],
  [['apple music', 'applemusic'], { tab: 'subscription', category: 'music', cancelAnytime: true }],
  [['tidal'], { tab: 'subscription', category: 'music', cancelAnytime: true }],
  [['deezer', 'deeser'], { tab: 'subscription', category: 'music', cancelAnytime: true }],
  [['amazon music', 'amazonmusic'], { tab: 'subscription', category: 'music', cancelAnytime: true }],
  [['soundcloud', 'sound cloud'], { tab: 'subscription', category: 'music', cancelAnytime: true }],
  [['pandora'], { tab: 'subscription', category: 'music', cancelAnytime: true }],
  [['napster'], { tab: 'subscription', category: 'music', cancelAnytime: true }],
  // ── GAMING ─────────────────────────────────────────────────────
  [['xbox', 'game pass', 'gamepass'], { tab: 'subscription', category: 'gaming', cancelAnytime: true }],
  [['playstation', 'ps plus', 'psplus', 'playstaion'], { tab: 'subscription', category: 'gaming', cancelAnytime: true }],
  [['nintendo', 'nintento'], { tab: 'subscription', category: 'gaming', cancelAnytime: true }],
  [['ea play', 'ea sports', 'ea fc'], { tab: 'subscription', category: 'gaming', cancelAnytime: true }],
  [['steam'], { tab: 'subscription', category: 'gaming', cancelAnytime: true }],
  [['twitch'], { tab: 'subscription', category: 'gaming', cancelAnytime: true }],
  [['humble bundle', 'humblebundle'], { tab: 'subscription', category: 'gaming', cancelAnytime: true }],
  [['gog', 'epic games', 'epicgames'], { tab: 'subscription', category: 'gaming', cancelAnytime: true }],
  // ── SOFTWARE / TOOLS ───────────────────────────────────────────
  [['adobe', 'adob', 'adobi'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['microsoft', 'microsft', 'microsoft 365', 'office 365'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['dropbox', 'drop box'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['notion'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['slack'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['github', 'git hub'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['figma'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['chatgpt', 'chat gpt', 'openai', 'open ai'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['claude', 'anthropic'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['canva'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['zoom'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['grammarly', 'gramarly'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['1password', 'lastpass', 'bitwarden'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['evernote', 'onenote'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['todoist', 'asana', 'trello'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['icloud', 'google one', 'google drive'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['nordvpn', 'expressvpn', 'surfshark', 'vpn'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['linktree', 'squarespace', 'wix', 'webflow'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  // AI & voice tools
  [['wispr', 'wispr flow'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['otter.ai', 'otter ai', 'otterai'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['superhuman'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['loom'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['linear'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['craft'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['bear'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['obsidian'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['readwise'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['reeder'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['miro'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['monday', 'monday.com'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['clickup', 'click up'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['airtable', 'air table'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['zapier'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['make', 'integromat'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['mailchimp', 'mail chimp'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['hubspot', 'hub spot'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['typeform'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['calendly'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['docusign', 'docu sign'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['sketch'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['framer'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['webstorm', 'phpstorm', 'intellij', 'jetbrains'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['cursor', 'cursor ai'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['copilot', 'github copilot'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['perplexity'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['midjourney', 'mid journey'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['elevenlabs', 'eleven labs'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['affinity', 'affinity photo', 'affinity designer'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['setapp'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['bartender'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['cleanmymac', 'clean my mac'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['backblaze', 'back blaze'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['proton', 'protonmail', 'proton mail', 'protonvpn'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['fastmail', 'fast mail'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['hey.com', 'hey email'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['shopify'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  [['stripe'], { tab: 'subscription', category: 'software', cancelAnytime: true }],
  // ── NEWS / MEDIA ───────────────────────────────────────────────
  [['new york times', 'nytimes', 'nyt'], { tab: 'subscription', category: 'news' }],
  [['the economist', 'economist'], { tab: 'subscription', category: 'news' }],
  [['financieel dagblad', 'fd.nl'], { tab: 'subscription', category: 'news' }],
  [['volkskrant', 'de volkskrant'], { tab: 'subscription', category: 'news' }],
  [['nrc'], { tab: 'subscription', category: 'news' }],
  [['telegraaf', 'de telegraaf'], { tab: 'subscription', category: 'news' }],
  [['ad.nl', 'algemeen dagblad'], { tab: 'subscription', category: 'news' }],
  [['trouw', 'parool'], { tab: 'subscription', category: 'news' }],
  [['guardian', 'the guardian'], { tab: 'subscription', category: 'news' }],
  [['washington post', 'wapo'], { tab: 'subscription', category: 'news' }],
  [['bbc', 'bbc news'], { tab: 'subscription', category: 'news' }],
  [['der spiegel', 'spiegel'], { tab: 'subscription', category: 'news' }],
  [['le monde', 'le figaro'], { tab: 'subscription', category: 'news' }],
  [['medium.com', 'substack'], { tab: 'subscription', category: 'news' }],
  // ── FITNESS ────────────────────────────────────────────────────
  [['gym', 'fitness', 'fitnessclub', 'fitnessstudio'], { tab: 'subscription', category: 'fitness' }],
  [['sportschool', 'sport school', 'sportclub', 'sport club'], { tab: 'subscription', category: 'fitness' }],
  [['peloton', 'pelton'], { tab: 'subscription', category: 'fitness' }],
  [['myfitnesspal', 'my fitness pal'], { tab: 'subscription', category: 'fitness' }],
  [['strava'], { tab: 'subscription', category: 'fitness' }],
  [['headspace', 'calm', 'meditatie', 'meditation'], { tab: 'subscription', category: 'fitness' }],
  [['classpass', 'class pass'], { tab: 'subscription', category: 'fitness' }],
  [['zwift'], { tab: 'subscription', category: 'fitness' }],
  [['basic-fit', 'basicfit', 'basic fit'], { tab: 'subscription', category: 'fitness' }],
  // ── FOOD / MEAL KITS ───────────────────────────────────────────
  [['hellofresh', 'hello fresh', 'helo fresh'], { tab: 'subscription', category: 'food' }],
  [['marley spoon', 'marleyspoon'], { tab: 'subscription', category: 'food' }],
  [['factor', 'factor meals'], { tab: 'subscription', category: 'food' }],
  [['gousto'], { tab: 'subscription', category: 'food' }],
  [['maaltijdbox', 'maaltijd box'], { tab: 'subscription', category: 'food' }],
  // ── LOTTERY / KANSSPEL ─────────────────────────────────────────
  [['staatsloterij', 'staats loterij'], { tab: 'subscription', category: 'lottery' }],
  [['lotto', 'loterij', 'lottery'], { tab: 'subscription', category: 'lottery' }],
  [['postcodeloterij', 'postcode loterij'], { tab: 'subscription', category: 'lottery' }],
  [['eurojackpot', 'euro jackpot'], { tab: 'subscription', category: 'lottery' }],
  // ── HOUSING ────────────────────────────────────────────────────
  [['hypotheek', 'hyptheek', 'hypotheek'], { tab: 'fixed', category: 'mortgage' }],
  [['mortgage', 'mortage', 'mortgaje'], { tab: 'fixed', category: 'mortgage' }],
  [['huur', 'huurbetaling'], { tab: 'fixed', category: 'rent' }],
  [['rent', 'rental', 'huurprijs'], { tab: 'fixed', category: 'rent' }],
  [['miete', 'kaltmiete', 'warmmiete'], { tab: 'fixed', category: 'rent' }], // DE
  [['loyer', 'loyer mensuel'], { tab: 'fixed', category: 'rent' }], // FR
  [['alquiler', 'arrendamiento'], { tab: 'fixed', category: 'rent' }], // ES
  [['affitto', 'canone affitto'], { tab: 'fixed', category: 'rent' }], // IT
  [['hyra', 'hyresavgift'], { tab: 'fixed', category: 'rent' }], // SE
  [['husleie'], { tab: 'fixed', category: 'rent' }], // NO
  [['husleje'], { tab: 'fixed', category: 'rent' }], // DK
  // ── HEALTH INSURANCE ───────────────────────────────────────────
  [['zorgverzekering', 'zorgverzeking', 'zorgverzekring'], { tab: 'fixed', category: 'health_insurance' }],
  [['health insurance', 'healthinsurance', 'ziektekostenverzekering'], { tab: 'fixed', category: 'health_insurance' }],
  [['krankenversicherung', 'krankenkasse'], { tab: 'fixed', category: 'health_insurance' }], // DE
  [['assurance maladie', 'mutuelle'], { tab: 'fixed', category: 'health_insurance' }], // FR
  [['seguro medico', 'seguro salud'], { tab: 'fixed', category: 'health_insurance' }], // ES
  [['assicurazione sanitaria'], { tab: 'fixed', category: 'health_insurance' }], // IT
  [['sjukförsäkring', 'sjukvardsforsakring'], { tab: 'fixed', category: 'health_insurance' }], // SE
  [['sykeforsikring'], { tab: 'fixed', category: 'health_insurance' }], // NO
  // ── CAR INSURANCE ──────────────────────────────────────────────
  [['autoverzekering', 'autoverzekring', 'auto verzekering'], { tab: 'fixed', category: 'car_insurance' }],
  [['car insurance', 'auto insurance', 'vehicle insurance'], { tab: 'fixed', category: 'car_insurance' }],
  [['kfz-versicherung', 'autoversicherung'], { tab: 'fixed', category: 'car_insurance' }], // DE
  [['assurance auto', 'assurance voiture'], { tab: 'fixed', category: 'car_insurance' }], // FR
  [['seguro coche', 'seguro auto'], { tab: 'fixed', category: 'car_insurance' }], // ES
  [['assicurazione auto'], { tab: 'fixed', category: 'car_insurance' }], // IT
  [['bilförsäkring'], { tab: 'fixed', category: 'car_insurance' }], // SE
  [['bilforsikring'], { tab: 'fixed', category: 'car_insurance' }], // NO/DK
  // ── HOME INSURANCE ─────────────────────────────────────────────
  [['opstalverzekering', 'inboedelverzekering', 'woonverzekering'], { tab: 'fixed', category: 'home_insurance' }],
  [['home insurance', 'contents insurance', 'buildings insurance'], { tab: 'fixed', category: 'home_insurance' }],
  [['hausratversicherung', 'wohngebaudeversicherung'], { tab: 'fixed', category: 'home_insurance' }], // DE
  [['assurance habitation', 'assurance maison'], { tab: 'fixed', category: 'home_insurance' }], // FR
  [['seguro hogar', 'seguro casa'], { tab: 'fixed', category: 'home_insurance' }], // ES
  [['hemförsäkring'], { tab: 'fixed', category: 'home_insurance' }], // SE
  [['innboforsikring', 'hjemforsikring'], { tab: 'fixed', category: 'home_insurance' }], // NO
  // ── ENERGY ─────────────────────────────────────────────────────
  [['energie', 'energierekening', 'energieleverancier'], { tab: 'fixed', category: 'energy' }],
  [['energy', 'electricity', 'gas bill', 'utilities bill'], { tab: 'fixed', category: 'energy' }],
  [['vattenfall', 'eneco', 'essent', 'nuon', 'greenchoice', 'oxxio'], { tab: 'fixed', category: 'energy' }],
  [['stroom', 'gas en stroom', 'gas & stroom'], { tab: 'fixed', category: 'energy' }],
  [['strom', 'gasrechnung', 'stromrechnung'], { tab: 'fixed', category: 'energy' }], // DE
  [['electricite', 'gaz naturel', 'edf'], { tab: 'fixed', category: 'energy' }], // FR
  [['luz y gas', 'factura luz'], { tab: 'fixed', category: 'energy' }], // ES
  [['el og gas', 'elregning'], { tab: 'fixed', category: 'energy' }], // NO/DK
  // ── INTERNET ───────────────────────────────────────────────────
  [['ziggo', 'zigg'], { tab: 'fixed', category: 'internet' }],
  [['kpn'], { tab: 'fixed', category: 'internet' }],
  [['internet', 'breedband', 'broadband', 'glasvezel', 'fiber'], { tab: 'fixed', category: 'internet' }],
  [['delta', 'caiway', 'odido', 'xs4all'], { tab: 'fixed', category: 'internet' }],
  [['sky broadband', 'bt broadband', 'virgin media'], { tab: 'fixed', category: 'internet' }], // UK
  [['comcast', 'xfinity', 'spectrum'], { tab: 'fixed', category: 'internet' }], // US
  // ── MOBILE PHONE ───────────────────────────────────────────────
  [['t-mobile', 'tmobile', 'tele2', 'lebara', 'simyo'], { tab: 'fixed', category: 'mobile_phone' }],
  [['vodafone', 'voda fone'], { tab: 'fixed', category: 'mobile_phone' }],
  [['telefoon', 'mobiel', 'mobiele telefoon', 'phone bill'], { tab: 'fixed', category: 'mobile_phone' }],
  [['o2', 'ee mobile', 'three mobile'], { tab: 'fixed', category: 'mobile_phone' }], // UK
  [['at&t', 'verizon', 'tmobile us'], { tab: 'fixed', category: 'mobile_phone' }], // US
  [['telenet', 'proximus', 'base'], { tab: 'fixed', category: 'mobile_phone' }], // BE
  [['swisscom', 'sunrise'], { tab: 'fixed', category: 'mobile_phone' }], // CH
  // ── ROAD TAX ───────────────────────────────────────────────────
  [['motorrijtuigenbelasting', 'mrb'], { tab: 'fixed', category: 'road_tax' }],
  [['wegenbelasting', 'wegen belasting'], { tab: 'fixed', category: 'road_tax' }],
  [['car tax', 'road tax', 'vehicle tax', 'vehicle excise'], { tab: 'fixed', category: 'road_tax' }],
  [['kraftfahrzeugsteuer', 'kfz-steuer'], { tab: 'fixed', category: 'road_tax' }], // DE
  [['taxe vehicule', 'carte grise'], { tab: 'fixed', category: 'road_tax' }], // FR
  [['impuesto circulacion', 'ivtm'], { tab: 'fixed', category: 'road_tax' }], // ES
  [['fordonsskatt', 'vagskatt'], { tab: 'fixed', category: 'road_tax' }], // SE
  [['arsavgift bil', 'trafikkforsikringsavgift'], { tab: 'fixed', category: 'road_tax' }], // NO
  // ── MUNICIPAL TAX ──────────────────────────────────────────────
  [['gemeentebelasting', 'gemeente belasting', 'ozb', 'waterschapsbelasting'], { tab: 'fixed', category: 'municipal_tax' }],
  [['council tax', 'council rates'], { tab: 'fixed', category: 'municipal_tax' }], // UK
  [['grundsteuer', 'gemeindesteuer'], { tab: 'fixed', category: 'municipal_tax' }], // DE
  [['taxe fonciere', 'taxe habitation'], { tab: 'fixed', category: 'municipal_tax' }], // FR
  [['ibi', 'impuesto municipal'], { tab: 'fixed', category: 'municipal_tax' }], // ES
  [['kommunalskatt'], { tab: 'fixed', category: 'municipal_tax' }], // SE
  [['kommuneskatt', 'ejendomsskat'], { tab: 'fixed', category: 'municipal_tax' }], // DK
  // ── CHILDCARE ──────────────────────────────────────────────────
  [['kinderopvang', 'kinderopfang', 'kinderopvanng', 'kinderoopvang'], { tab: 'fixed', category: 'childcare' }],
  [['kinderdagverblijf', 'kdv', 'kdw'], { tab: 'fixed', category: 'childcare' }],
  [['bso', 'buitenschoolse opvang', 'naschoolse opvang'], { tab: 'fixed', category: 'childcare' }],
  [['childcare', 'child care', 'daycare', 'day care'], { tab: 'fixed', category: 'childcare' }],
  [['nursery', 'nursery school', 'after school care', 'breakfast club'], { tab: 'fixed', category: 'childcare' }], // UK
  [['kita', 'kindergarten', 'kindertagesstatte', 'kiga'], { tab: 'fixed', category: 'childcare' }], // DE
  [['creche', 'crèche', 'garderie', 'halte-garderie', 'halte garderie'], { tab: 'fixed', category: 'childcare' }], // FR/BE
  [['guarderia', 'jardin de infancia'], { tab: 'fixed', category: 'childcare' }], // ES
  [['asilo nido', 'nido', 'materna'], { tab: 'fixed', category: 'childcare' }], // IT
  [['dagis', 'forskola', 'förskola'], { tab: 'fixed', category: 'childcare' }], // SE
  [['barnehage', 'sfo'], { tab: 'fixed', category: 'childcare' }], // NO
  [['børnehave', 'dagpleje', 'vuggestue'], { tab: 'fixed', category: 'childcare' }], // DK
  // ── ROAD SERVICE ───────────────────────────────────────────────
  [['anwb', 'wegenwacht', 'anwb wegenwacht'], { tab: 'fixed', category: 'road_service' }],
  [['aa membership', 'rac membership', 'green flag'], { tab: 'fixed', category: 'road_service' }], // UK
  [['adac'], { tab: 'fixed', category: 'road_service' }], // DE
  // ── MAGAZINE ───────────────────────────────────────────────────
  [['tijdschrift', 'magazine', 'blad abonnement'], { tab: 'subscription', category: 'magazine' }],
  [['national geographic', 'libelle', 'margriet', 'linda', 'vogue', 'flow', 'kijk', 'panorama'], { tab: 'subscription', category: 'magazine' }],
  // ── SERVICE CONTRACT ───────────────────────────────────────────
  [['servicecontract', 'service contract', 'onderhoudscontract', 'onderhoud contract'], { tab: 'fixed', category: 'service_contract' }],
  [['garantie', 'extended warranty', 'applecare', 'apple care', 'samsung care'], { tab: 'fixed', category: 'service_contract' }],
  // ── WEBSHOP MEMBERSHIP ─────────────────────────────────────────
  [['bol.com select', 'bol select', 'zalando plus'], { tab: 'subscription', category: 'webshop', cancelAnytime: true }],
  // ── PENSION ────────────────────────────────────────────────────
  [['pensioen', 'pensioenpremie', 'pensioenfonds'], { tab: 'fixed', category: 'pension' }],
  [['pension', 'private pension', 'workplace pension'], { tab: 'fixed', category: 'pension' }],
  [['rentenversicherung', 'altersvorsorge', 'rente'], { tab: 'fixed', category: 'pension' }], // DE
  [['retraite', 'assurance retraite'], { tab: 'fixed', category: 'pension' }], // FR
  [['plan pensiones', 'pension privada'], { tab: 'fixed', category: 'pension' }], // ES
  [['tjänstepension', 'premiepension'], { tab: 'fixed', category: 'pension' }], // SE
  [['pensjonssparing', 'tjenestepensjon'], { tab: 'fixed', category: 'pension' }], // NO
]

// Simple 1-edit-distance check (handles single typo in words 5+ chars)
function fuzzyMatch(input: string, keyword: string): boolean {
  if (input.includes(keyword)) return true
  if (keyword.length < 5) return input.includes(keyword)
  // Allow 1 character difference for keywords 5+ chars
  if (Math.abs(input.length - keyword.length) > 2) return false
  let mismatches = 0
  const len = Math.max(input.length, keyword.length)
  for (let i = 0; i < len; i++) {
    if (input[i] !== keyword[i]) {
      mismatches++
      if (mismatches > 1) return false
    }
  }
  return mismatches <= 1
}

function detectFromName(name: string): DetectResult | null {
  const lower = name.toLowerCase().trim()
  if (lower.length < 3) return null
  for (const [keywords, result] of AUTO_DETECT_RULES) {
    for (const keyword of keywords) {
      // Exact substring match first (fast)
      if (lower.includes(keyword)) return result
      // Fuzzy match on individual words for longer keywords
      if (keyword.length >= 5) {
        const inputWords = lower.split(/[\s-_]+/)
        const keyWords = keyword.split(/[\s-_]+/)
        if (keyWords.every(kw => inputWords.some(iw => fuzzyMatch(iw, kw)))) return result
      }
    }
  }
  return null
}

const SUBSCRIPTION_CATEGORIES = [
  { value: 'streaming',   label: '▶️ Streaming' },
  { value: 'music',       label: '🎵 Music' },
  { value: 'gaming',      label: '🎮 Gaming' },
  { value: 'news',        label: '📰 News & Media' },
  { value: 'software',    label: '💻 Software & Apps' },
  { value: 'food',        label: '🍔 Food & Delivery' },
  { value: 'fitness',     label: '💪 Fitness' },
  { value: 'sports_club', label: '⚽ Sports Club' },
  { value: 'hobby_club',  label: '🎨 Hobby / Club' },
  { value: 'lottery',     label: '🎰 Lottery' },
  { value: 'webshop',     label: '🛒 Webshop membership' },
  { value: 'magazine',   label: '📖 Magazine' },
  { value: 'other_sub',  label: '📦 Other subscription' },
]

const FIXED_CATEGORIES = [
  { value: 'mortgage',             label: '🏠 Mortgage' },
  { value: 'rent',                 label: '🏢 Rent' },
  { value: 'energy',               label: '⚡ Energy (Gas / Electricity / Water)' },
  { value: 'health_insurance',     label: '🏥 Health Insurance' },
  { value: 'disability_insurance', label: '🩺 Disability Insurance' },
  { value: 'home_insurance',       label: '🏗️ Home & Contents Insurance' },
  { value: 'car_insurance',        label: '🚗 Car Insurance' },
  { value: 'road_tax',             label: '🛣️ Road Tax' },
  { value: 'municipal_tax',        label: '🏛️ Municipal Tax' },
  { value: 'pension',              label: '👴 Pension' },
  { value: 'mobile_phone',         label: '📱 Mobile Phone' },
  { value: 'internet',             label: '🌐 Internet' },
  { value: 'childcare',            label: '🧒 Childcare / Education' },
  { value: 'car_fuel',             label: '⛽ Car Fuel' },
  { value: 'maintenance',          label: '🔧 Maintenance' },
  { value: 'road_service',     label: '🚘 Road Service (ANWB / AA)' },
  { value: 'service_contract', label: '🔒 Service Contract / Warranty' },
  { value: 'other_fixed',      label: '📋 Other fixed cost' },
]

// Categories where a free trial makes sense
const TRIAL_CATEGORIES = new Set(['streaming', 'music', 'gaming', 'software', 'news', 'fitness'])

// Categories where renewal date + notice period are useful
const RENEWAL_CATEGORIES = new Set([
  'streaming', 'music', 'gaming', 'software', 'news', 'fitness',
  'sports_club', 'hobby_club', 'food', 'other_sub',
  'mobile_phone', 'internet', 'energy',
])

export default function AddSubscriptionForm({ onAdd, onCancel }: AddSubscriptionFormProps) {
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [frequency, setFrequency] = useState<BillingFrequency>('monthly')
  const [category, setCategory] = useState<SubscriptionCategory_All>('streaming')
  const [renewalDate, setRenewalDate] = useState(new Date().toISOString().split('T')[0])
  const [noticePeriod, setNoticePeriod] = useState(0)
  const [cancelAnytime, setCancelAnytime] = useState(false)
  const [isTrial, setIsTrial] = useState(false)
  const [trialEndsDate, setTrialEndsDate] = useState('2026-03-25')
  const [lotteryTickets, setLotteryTickets] = useState(1)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [tab, setTab] = useState<'subscription' | 'fixed'>('fixed')
  const [autoDetected, setAutoDetected] = useState(false)

  const handleTabSwitch = (t: 'subscription' | 'fixed') => {
    setTab(t)
    setCategory(t === 'subscription' ? 'streaming' : 'mortgage')
    setIsTrial(false)
    setShowMoreOptions(false)
  }

  const isFixed = tab === 'fixed'
  const isLottery = category === 'lottery'
  const showTrialToggle = !isFixed && TRIAL_CATEGORIES.has(category)
  const showRenewalFields = !isFixed && RENEWAL_CATEGORIES.has(category)

  // Auto-set sensible frequency per category
  useEffect(() => {
    if (category === 'road_tax' || category === 'municipal_tax') setFrequency('yearly')
    else if (['mortgage', 'rent', 'energy', 'pension', 'health_insurance',
              'disability_insurance', 'home_insurance', 'car_insurance',
              'mobile_phone', 'internet', 'childcare'].includes(category)) setFrequency('monthly')
  }, [category])

  const effectiveCost = isLottery
    ? (parseFloat(cost) || 0) * lotteryTickets
    : parseFloat(cost) || 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !cost) return
    onAdd({
      name,
      cost: effectiveCost,
      frequency,
      category,
      renewalDate: new Date(renewalDate),
      isTrial: isTrial || undefined,
      trialEndsDate: isTrial && trialEndsDate ? new Date(trialEndsDate) : undefined,
      noticePeriod: isFixed ? 0 : (showRenewalFields && showMoreOptions ? noticePeriod : 0),
      isFixedCost: isFixed || isFixedCostCategory(category),
    })
    setName(''); setCost(''); setFrequency('monthly')
    setCategory(tab === 'subscription' ? 'streaming' : 'mortgage')
    setRenewalDate(new Date().toISOString().split('T')[0])
    setIsTrial(false); setTrialEndsDate(''); setLotteryTickets(1); setShowMoreOptions(false)
    setCancelAnytime(false); setNoticePeriod(0)
  }

  return (
    <div className="glass rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Add to your overview</h3>

      {/* Tab switcher */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-5">
        <button type="button" data-tab="fixed"
          onClick={() => handleTabSwitch('fixed')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
            isFixed ? 'bg-gray-700 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >🏠 Fixed Cost</button>
        <button type="button"
          onClick={() => handleTabSwitch('subscription')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
            !isFixed ? 'bg-purple-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >📱 Subscription</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── LAYER 1: Always visible ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input type="text" value={name} onChange={e => {
            const val = e.target.value
            setName(val)
            const match = detectFromName(val)
            if (match && val.length >= 3) {
              setTab(match.tab)
              setCategory(match.category)
              setAutoDetected(true)
              if (match.cancelAnytime) {
                setCancelAnytime(true)
                setNoticePeriod(0)
              } else {
                setCancelAnytime(false)
              }
            } else {
              setAutoDetected(false)
              setCancelAnytime(false)
            }
          }}
            placeholder={isFixed ? 'Mortgage, Insurance, Pension...' : 'Netflix, Gym, Spotify...'}
            autoFocus required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent" />
          {autoDetected && (
            <p style={{ fontSize: '0.75rem', color: '#7c3aed', marginTop: '0.3rem', fontWeight: 500 }}>
              ✨ Automatically recognized — check the type above if needed
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input type="number" step="0.01" value={cost} onChange={e => setCost(e.target.value)}
              placeholder="9.99" required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">How often?</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value as BillingFrequency)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent">
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value as SubscriptionCategory_All)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent">
            {(isFixed ? FIXED_CATEGORIES : SUBSCRIPTION_CATEGORIES).map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* ── LAYER 2: Smart contextual fields ── */}

        {/* Lottery ticket counter */}
        {isLottery && cost && (
          <div style={{
            background: '#fffbeb', border: '1.5px solid #fde68a',
            borderRadius: 10, padding: '0.85rem 1rem',
          }}>
            <p className="text-sm font-medium text-amber-700 mb-2">
              🎰 How many tickets or lines?
            </p>
            <div className="flex items-center gap-3">
              <button type="button"
                onClick={() => setLotteryTickets(Math.max(1, lotteryTickets - 1))}
                className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center hover:bg-amber-200 transition-colors">
                −
              </button>
              <span className="text-lg font-bold text-amber-800 w-8 text-center">{lotteryTickets}</span>
              <button type="button"
                onClick={() => setLotteryTickets(lotteryTickets + 1)}
                className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center hover:bg-amber-200 transition-colors">
                +
              </button>
              <span className="text-sm text-amber-600 ml-1">
                = <strong>€{effectiveCost.toFixed(2)}</strong> total / {frequency}
              </span>
            </div>
          </div>
        )}

        {/* Free trial toggle — only for relevant categories */}
        {showTrialToggle && (
          <div onClick={() => setIsTrial(!isTrial)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer',
            background: isTrial ? '#fefce8' : '#f9fafb',
            border: `1.5px solid ${isTrial ? '#fde68a' : '#e5e7eb'}`,
          }}>
            <div>
              <p style={{ fontFamily: 'system-ui', fontSize: '0.85rem', fontWeight: 600, color: '#374151', margin: 0 }}>
                ⏱️ This is a free trial
              </p>
              <p style={{ fontFamily: 'system-ui', fontSize: '0.75rem', color: '#6b7280', margin: '0.1rem 0 0' }}>
                Get a warning before it converts to paid
              </p>
            </div>
            <div style={{
              width: 40, height: 22, borderRadius: 99, position: 'relative',
              background: isTrial ? '#7c3aed' : '#d1d5db', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 3, left: isTrial ? 20 : 3,
                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>
        )}

        {/* Trial end date — only when trial toggled on */}
        {showTrialToggle && isTrial && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trial ends on</label>
            <input type="date" value={trialEndsDate}
              min="2026-03-11" max="2027-03-11"
              onChange={e => {
                const val = e.target.value
                // Guard against year-0006 style input bugs
                if (val && new Date(val).getFullYear() > 2000) setTrialEndsDate(val)
                else if (!val) setTrialEndsDate(val)
              }}
              className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent" />
            <p className="text-xs mt-1" style={{color:"#7c3aed",fontWeight:500}}>✨ We'll remind you before it converts to paid.</p>
          </div>
        )}

        {/* ── LAYER 3: More options (hidden by default) ── */}
        {showRenewalFields && (
          <button type="button"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-600 transition-colors">
            <span style={{
              display: 'inline-block', transition: 'transform 0.2s',
              transform: showMoreOptions ? 'rotate(90deg)' : 'rotate(0deg)',
              fontSize: '0.6rem',
            }}>▶</span>
            {showMoreOptions ? 'Hide options' : '⚙️ Set renewal date & notice period'}
          </button>
        )}

        {showRenewalFields && showMoreOptions && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            {/* Notice period FIRST */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation notice period</label>
              <select value={noticePeriod} onChange={e => {
                const val = Number(e.target.value)
                setNoticePeriod(val)
                setCancelAnytime(val === 0)
              }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent">
                <option value={0}>None — cancel anytime</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days (most common)</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
              {cancelAnytime && (
                <p className="text-xs text-green-600 mt-1 font-medium">✓ No renewal date needed — cancel whenever you want</p>
              )}
              {!cancelAnytime && (
                <p className="text-xs text-gray-400 mt-1">We'll remind you in time to cancel before the next renewal.</p>
              )}
            </div>
            {/* Renewal date — only shown when there IS a notice period */}
            {!cancelAnytime && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next renewal date</label>
                <input type="date" value={renewalDate} onChange={e => setRenewalDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent" />
                <p className="text-xs text-gray-400 mt-1">For monthly subscriptions, set the date of your next billing cycle.</p>
              </div>
            )}
          </div>
        )}

        {/* Cancel anytime badge — shown inline when auto-detected, no options needed */}
        {showRenewalFields && !showMoreOptions && cancelAnytime && (
          <p className="text-xs text-green-600 font-medium">✓ Cancel anytime — no renewal date needed</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit"
            className={`flex-1 text-white font-semibold py-3 rounded-lg transition-all shadow-lg ${
              isFixed
                ? 'bg-gray-700 hover:bg-gray-800'
                : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'
            }`}>
            Add
          </button>
          <button type="button" onClick={onCancel}
            className="px-6 bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
