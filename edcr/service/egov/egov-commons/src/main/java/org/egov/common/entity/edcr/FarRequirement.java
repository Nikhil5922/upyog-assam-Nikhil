package org.egov.common.entity.edcr;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

public class FarRequirement extends MdmsFeatureRule {

	@JsonProperty("permissibleLight")
	private BigDecimal permissibleLight;

	@JsonProperty("permissibleMedium")
	private BigDecimal permissibleMedium;

	@JsonProperty("permissibleFlattered")
	private BigDecimal permissibleFlattered;
	
	@JsonProperty("maxTDRLoading")
	private BigDecimal maxTDRLoading;
	
	public BigDecimal getBaseFar() {
		return baseFar;
	}

	public void setBaseFar(BigDecimal baseFar) {
		this.baseFar = baseFar;
	}

	@JsonProperty("baseFar")
	private BigDecimal baseFar;

	public BigDecimal getMaxTDRLoading() {
		return maxTDRLoading;
	}

	public void setMaxTDRLoading(BigDecimal maxTDRLoading) {
		this.maxTDRLoading = maxTDRLoading;
	}

	public BigDecimal getPermissibleLight() {
		return permissibleLight;
	}

	public void setPermissibleLight(BigDecimal permissibleLight) {
		this.permissibleLight = permissibleLight;
	}

	public BigDecimal getPermissibleMedium() {
		return permissibleMedium;
	}

	public void setPermissibleMedium(BigDecimal permissibleMedium) {
		this.permissibleMedium = permissibleMedium;
	}

	public BigDecimal getPermissibleFlattered() {
		return permissibleFlattered;
	}

	public void setPermissibleFlattered(BigDecimal permissibleFlattered) {
		this.permissibleFlattered = permissibleFlattered;
	}

	@Override
	public String toString() {
		return "FarRequirement [permissibleLight=" + permissibleLight + ", permissibleMedium=" + permissibleMedium
				+ ", permissibleFlattered=" + permissibleFlattered + ", maxTDRLoading=" + maxTDRLoading + ", baseFar="
				+ baseFar + "]";
	}
}
