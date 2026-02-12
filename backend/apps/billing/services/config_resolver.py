import logging

logger = logging.getLogger(__name__)


def resolve_billing_config(property_obj):
    """
    Resolve the effective billing configuration for a property.

    Hierarchy:
    1. Organization BillingConfig is the master switch.
       If org.emission_mode == "disabled", returns None (property cannot override).
    2. PropertyBillingConfig can override emission_mode and connection details.
    3. Series (boleta/factura) always come from property config.

    Returns dict with all resolved config or None if billing is disabled.
    """
    # 1. Org config
    org_config = getattr(property_obj.organization, "billing_config", None)
    if not org_config or org_config.emission_mode == "disabled":
        return None

    # 2. Property emission_mode
    prop_config = getattr(property_obj, "billing_config", None)
    if prop_config:
        if prop_config.emission_mode == "disabled":
            return None
        elif prop_config.emission_mode in ("manual", "automatic"):
            resolved_mode = prop_config.emission_mode
        else:  # inherit
            resolved_mode = org_config.emission_mode
    else:
        resolved_mode = org_config.emission_mode

    # 3. Connection details (property override or org)
    if prop_config and prop_config.usa_configuracion_propia:
        proveedor = prop_config.proveedor or org_config.proveedor
        api_endpoint = prop_config.api_endpoint or org_config.api_endpoint
        api_key = prop_config.api_key or org_config.api_key
    else:
        proveedor = org_config.proveedor
        api_endpoint = org_config.api_endpoint
        api_key = org_config.api_key

    # 4. Series always from property
    serie_boleta = (prop_config.serie_boleta if prop_config else "") or ""
    serie_factura = (prop_config.serie_factura if prop_config else "") or ""

    return {
        "emission_mode": resolved_mode,
        "ruc": org_config.ruc,
        "razon_social": org_config.razon_social,
        "direccion_fiscal": org_config.direccion_fiscal,
        "ambiente": org_config.ambiente,
        "proveedor": proveedor,
        "api_endpoint": api_endpoint,
        "api_key": api_key,
        "serie_boleta": serie_boleta,
        "serie_factura": serie_factura,
        "establecimiento_codigo": (
            prop_config.establecimiento_codigo if prop_config else ""
        ),
        "punto_emision": (prop_config.punto_emision if prop_config else ""),
        "configuracion_tributaria": org_config.configuracion_tributaria,
    }
