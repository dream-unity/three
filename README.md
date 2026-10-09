# Dream Universe

Repository: [dream-unity/three](https://github.com/dream-unity/three)  
Intended address: https://dreamuniverse.one/

Dream Universe’s founding website for a social digital universe of film, music and shared worlds in virtual reality. The original Dream Unity portal artwork and parchment-and-ink identity connect the three creative territories. Native portal links and expandable vision notes work without JavaScript. Creation tools, community and VR experiences remain in development.

| Stage | Repository | Domain |
| --- | --- | --- |
| Dream Unity | `dream-unity/one` | `dreamunity.one` |
| Dream University | `dream-unity/two` | `dreamuniversity.one` |
| Dream Universe | `dream-unity/three` | `dreamuniverse.one` |

## Preparation and activation

`index.html`, `styles.css` and the original artwork in `assets/` form a static site with no external runtime dependencies. `CNAME` contains only `dreamuniverse.one`; `.nojekyll` allows direct static publication. No install or build command is needed.

**Preparation is not activation.** Repository files do not establish that Pages settings, DNS or HTTPS are ready. This preparation has not changed those settings.

1. In [account Pages settings](https://github.com/settings/pages), verify ownership using GitHub's generated TXT challenge for this domain. Keep that record after verification.
2. Open [this repository's Pages settings](https://github.com/dream-unity/three/settings/pages). Choose **Deploy from a branch**, **main**, **/(root)** and save. Set **Custom domain** to **dreamuniverse.one** and save it before changing web-routing DNS.
3. In Namecheap, open **Domain List → Manage → Advanced DNS** for **dreamuniverse.one**. Replace the parking/redirect entries for `@` and `www` with the records below, using Automatic TTL. Preserve unrelated records and existing nameservers.

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `dream-unity.github.io` |

The `www` target is the account hostname, without `/three`. Keep the existing IPv4-only configuration, matching Dream Unity.

4. Confirm the Pages deployment succeeds and the domain DNS check passes. Enable **Enforce HTTPS** when the certificate is ready; issuance and DNS propagation can take up to 24 hours.
5. Check HTTP and HTTPS for both apex and `www`: each must reach `https://dreamuniverse.one/` with the Dream Universe page and a valid certificate. Check all three navigation destinations after both new sites are activated.

Before activation, public DNS on 9 October 2026 showed `@` → `162.255.119.137` and `www` → `parkingpage.namecheap.com`. Inspect the current Namecheap zone before editing; public DNS does not expose Namecheap's internal redirect-rule type.

## Official setup references

- [GitHub publication source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub ownership verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [Namecheap GitHub Pages setup](https://www.namecheap.com/support/knowledgebase/article.aspx/9645/2208/how-do-i-link-my-domain-to-github-pages/)
