import { config } from "../../../xmr-constants";
import { possibleOAAddress } from "../mymonero-send-tx/internal_libs/open_alias_lite";
import { decode_address, NetType } from "../../../xmr-crypto-utils";
import { Omit } from "../types";

export enum URITypes {
	addressAsFirstPathComponent = 1,
	addressAsAuthority = 2,
}

// we can stricten this typing using
// a discriminate union later
// since the TURITypes determines the nullity of the value
type FundRequestPayload = {
	address: string;
	payment_id?: string | null;
	amount?: string | null;
	amountCcySymbol?: string | null;
	description?: string | null;
	message?: string | null;
	uriType: URITypes;
};

export function encodeFundRequest(args: FundRequestPayload) {
	const address = args.address;
	if (!address) {
		throw Error("missing address");
	}

	let mutable_uri = config.coinUriPrefix;

	const uriType = args.uriType;
	if (uriType === URITypes.addressAsAuthority) {
		mutable_uri += "//"; // use for inserting a // so data detectors pick it up…
	} else if (uriType === URITypes.addressAsFirstPathComponent) {
		// nothing to do
	} else {
		throw Error("Illegal args.uriType");
	}

	mutable_uri += address;
	let queryParamStart = true;

	type ParamName =
		| "tx_amount"
		| "tx_amount_ccy"
		| "tx_description"
		| "tx_payment_id"
		| "tx_message";

	function addParam(name: ParamName, value?: string | null) {
		if (!value) {
			return;
		}
		if (queryParamStart) {
			queryParamStart = false;
		}

		mutable_uri += queryParamStart ? "?" : "&";
		mutable_uri += name + "=" + encodeURIComponent(value);
	}

	addParam("tx_amount", args.amount);

	const shouldAddCcySym =
		(args.amountCcySymbol || "").toLowerCase() !==
		config.coinSymbol.toLowerCase();
	if (shouldAddCcySym) {
		addParam("tx_amount_ccy", args.amountCcySymbol);
	}

	addParam("tx_description", args.description);
	addParam("tx_payment_id", args.payment_id);
	addParam("tx_message", args.message);

	return mutable_uri;
}

type DecodeFundRequestPayload = Omit<FundRequestPayload, "uriType">;

export function decodeFundRequest(
	str: string,
	nettype: NetType,
): DecodeFundRequestPayload {
	// detect no-scheme moneroAddr and possible OA addr - if has no monero: prefix

	if (!str.startsWith(config.coinUriPrefix)) {
		if (str.includes("?")) {
			// fairly sure this is correct.. (just an extra failsafe/filter)
			throw Error("Unrecognized URI format");
		}

		if (possibleOAAddress(str)) {
			return {
				address: str,
			};
		}

		try {
			decode_address(str, nettype);
		} catch (e) {
			throw Error("No Monero request info");
		}

		// then it looks like a monero address
		return {
			address: str,
		};
	}

	const url = new window.URL(str);

	const protocol = url.protocol;
	if (protocol !== config.coinUriPrefix) {
		throw Error("Request URI has non-Monero protocol");
	}

	// it seems that if the URL has // in it, pathname will be empty, but host will contain the address instead
	let target_address = url.pathname || url.host || url.hostname;

	if (target_address.startsWith("//")) {
		target_address = target_address.slice("//".length); // strip prefixing "//" in case URL had protocol:// instead of protocol:
	}

	const searchParams = url.searchParams;

	const payload: DecodeFundRequestPayload = {
		address: target_address,
	};

	const keyPrefixToTrim = "tx_";
	(searchParams as any).forEach((value: string, key: string) => {
		const index = key.startsWith(keyPrefixToTrim)
			? key.slice(keyPrefixToTrim.length, key.length)
			: key;

		payload[index as keyof DecodeFundRequestPayload] = value;
	});

	return payload;
}
