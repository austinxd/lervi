import { getProperty, getRoomTypes } from "@/lib/api";
import { resolveTemplateKey } from "@/lib/theme-resolver";
import HeroEssential from "@/components/heroes/HeroEssential";
import HeroSignature from "@/components/heroes/HeroSignature";
import HeroPremium from "@/components/heroes/HeroPremium";
import AboutSection from "@/components/sections/AboutSection";
import AmenitiesSection from "@/components/sections/AmenitiesSection";
import GallerySection from "@/components/sections/GallerySection";
import RoomsSection from "@/components/sections/RoomsSection";
import CTASection from "@/components/sections/CTASection";
import InfoSection from "@/components/sections/InfoSection";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const [property, roomTypes] = await Promise.all([
    getProperty(slug),
    getRoomTypes(slug),
  ]);

  const template = resolveTemplateKey(property.theme_template);

  // Shared section elements
  const about = property.description ? (
    <AboutSection key="about" description={property.description} />
  ) : null;

  const rooms = (
    <RoomsSection
      key="rooms"
      roomTypes={roomTypes}
      currency={property.currency}
      template={template}
    />
  );

  const amenities = (
    <AmenitiesSection key="amenities" amenities={property.amenities} />
  );

  const gallery = (
    <GallerySection
      key="gallery"
      photos={property.photos}
      propertyName={property.name}
    />
  );

  const cta = <CTASection key="cta" template={template} />;

  const info = <InfoSection key="info" property={property} />;

  // Template-specific hero + section order
  if (template === "essential") {
    return (
      <div>
        <HeroEssential
          hotelName={property.name}
          city={property.city}
          tagline={property.tagline}
          heroImage={property.hero_image}
          stars={property.stars}
        />
        {about}
        {rooms}
        {amenities}
        {info}
        {cta}
      </div>
    );
  }

  if (template === "premium") {
    return (
      <div>
        <HeroPremium
          hotelName={property.name}
          city={property.city}
          tagline={property.tagline}
          heroImage={property.hero_image}
          photos={property.photos}
        />
        {about}
        {rooms}
        {gallery}
        {amenities}
        {cta}
        {info}
      </div>
    );
  }

  // Default: signature
  return (
    <div>
      <HeroSignature
        hotelName={property.name}
        city={property.city}
        tagline={property.tagline}
        heroImage={property.hero_image}
        stars={property.stars}
        photos={property.photos}
      />
      {about}
      {rooms}
      {gallery}
      {amenities}
      {cta}
      {info}
    </div>
  );
}
