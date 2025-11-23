import { useState, useEffect } from 'react';
import { useDynamicContext, useIsLoggedIn, useUserWallets } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { isAlgorandWallet } from '@dynamic-labs/algorand';
import { isSolanaWallet } from '@dynamic-labs/solana';
import { isStarknetWallet } from '@dynamic-labs/starknet';
import { isCosmosWallet } from '@dynamic-labs/cosmos';
import { isSuiWallet } from '@dynamic-labs/sui';
import { getWeb3Provider, getSigner } from "@dynamic-labs/ethers-v6";

import './Methods.css';

export default function DynamicMethods({ isDarkMode }: { isDarkMode: boolean }) {
	const isLoggedIn = useIsLoggedIn();
	const { sdkHasLoaded, primaryWallet, user } = useDynamicContext();
	const userWallets = useUserWallets();
	const [isLoading, setIsLoading] = useState(true);
	const [result, setResult] = useState<undefined | string>(undefined);
	const [error, setError] = useState<string | null>(null);

	const safeStringify = (obj: unknown): string => {
		const seen = new WeakSet();
		return JSON.stringify(obj, (key, value) => {
			if (typeof value === 'object' && value !== null) {
				if (seen.has(value)) {
					return '[Circular]';
				}
				seen.add(value);
			}
			return value;
		}, 2);
	};

	useEffect(() => {
		if (sdkHasLoaded && isLoggedIn && primaryWallet) {
			setIsLoading(false);
		} else {
			setIsLoading(true);
		}
	}, [sdkHasLoaded, isLoggedIn, primaryWallet]);

	function clearResult() {
		setResult(undefined);
		setError(null);
	}

	function showUser() {
		try {
			setError(null);
			setResult(safeStringify(user));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to stringify user data');
			setResult(undefined);
		}
	}

	function showUserWallets() {
		try {
			setError(null);
			setResult(safeStringify(userWallets));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to stringify wallet data');
			setResult(undefined);
		}
	}

	
  async function fetchEthereumProvider() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await getWeb3Provider(primaryWallet);
      setResult(safeStringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchEthereumSigner() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await getSigner(primaryWallet);
      setResult(safeStringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchEthereumMessage() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.signMessage("Hello World");
      setResult(safeStringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAlgorandSigner() {
    if (!primaryWallet || !isAlgorandWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.getSigner();
      setResult(safeStringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAlgorandMessage() {
    if (!primaryWallet || !isAlgorandWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.signMessage("Hello World");
      setResult(safeStringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSolanaConnection() {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.getConnection();
      setResult(safeStringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSolanaSigner() {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.getSigner();
      setResult(safeStringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSolanaMessage() {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.signMessage("Hello World");
      setResult(safeStringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchStarknetWalletAccount() {
    if (!primaryWallet || !isStarknetWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.getWalletAccount();
      setResult(safeStringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCosmosOfflineSigner() {
    if (!primaryWallet || !isCosmosWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.getOfflineSigner();
      setResult(safeStringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCosmosProvider() {
    if (!primaryWallet || !isCosmosWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.getProvider();
      setResult(safeStringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCosmosMessage() {
    if (!primaryWallet || !isCosmosWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.signMessage("Hello World");
      setResult(safeStringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSuiClient() {
    if (!primaryWallet || !isSuiWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.getSuiClient();
      setResult(safeStringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSuiWalletAccount() {
    if (!primaryWallet || !isSuiWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.getWalletAccount();
      setResult(safeStringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSuiActiveNetwork() {
    if (!primaryWallet || !isSuiWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.getActiveNetwork();
      setResult(safeStringify(result));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

	return (
		<>
			{!isLoading && (
				<div className="dynamic-methods" data-theme={isDarkMode ? 'dark' : 'light'}>
					<div className="methods-container">
						<button className="btn btn-primary" onClick={showUser}>Fetch User</button>
						<button className="btn btn-primary" onClick={showUserWallets}>Fetch User Wallets</button>

						{primaryWallet && isEthereumWallet(primaryWallet) && (
		<>
			
      <button type="button" className="btn btn-primary" onClick={fetchEthereumProvider}>
        Fetch Provider
      </button>

      <button type="button" className="btn btn-primary" onClick={fetchEthereumSigner}>
        Fetch Signer
      </button>

      <button type="button" className="btn btn-primary" onClick={fetchEthereumMessage}>
        Fetch Message
      </button>
		</>
	)}
{primaryWallet && isAlgorandWallet(primaryWallet) && (
		<>
			
      <button type="button" className="btn btn-primary" onClick={fetchAlgorandSigner}>
        Fetch Signer
      </button>

      <button type="button" className="btn btn-primary" onClick={fetchAlgorandMessage}>
        Fetch Message
      </button>
		</>
	)}
{primaryWallet && isSolanaWallet(primaryWallet) && (
		<>
			
      <button type="button" className="btn btn-primary" onClick={fetchSolanaConnection}>
        Fetch Connection
      </button>

      <button type="button" className="btn btn-primary" onClick={fetchSolanaSigner}>
        Fetch Signer
      </button>

      <button type="button" className="btn btn-primary" onClick={fetchSolanaMessage}>
        Fetch Message
      </button>
		</>
	)}

{primaryWallet && isStarknetWallet(primaryWallet) && (
		<>
			
      <button type="button" className="btn btn-primary" onClick={fetchStarknetWalletAccount}>
        Fetch WalletAccount
      </button>
		</>
	)}
{primaryWallet && isCosmosWallet(primaryWallet) && (
		<>
			
      <button type="button" className="btn btn-primary" onClick={fetchCosmosOfflineSigner}>
        Fetch OfflineSigner
      </button>

      <button type="button" className="btn btn-primary" onClick={fetchCosmosProvider}>
        Fetch Provider
      </button>

      <button type="button" className="btn btn-primary" onClick={fetchCosmosMessage}>
        Fetch Message
      </button>
		</>
	)}

{primaryWallet && isSuiWallet(primaryWallet) && (
		<>
			
      <button type="button" className="btn btn-primary" onClick={fetchSuiClient}>
        Fetch Client
      </button>

      <button type="button" className="btn btn-primary" onClick={fetchSuiWalletAccount}>
        Fetch WalletAccount
      </button>

      <button type="button" className="btn btn-primary" onClick={fetchSuiActiveNetwork}>
        Fetch ActiveNetwork
      </button>
		</>
	)}
					</div>
					
					{(result || error) && (
						<div className="results-container">
							{error ? (
								<pre className="results-text error">{error}</pre>
							) : (
								<pre className="results-text">
									{result && (
										typeof result === "string" && result.startsWith("{")
										? JSON.stringify(JSON.parse(result), null, 2)
										: result
									)}
								</pre>
							)}
						</div>
					)}
					
					{(result || error) && (
						<div className="clear-container">
							<button className="btn btn-primary" onClick={clearResult}>Clear</button>
						</div>
					)}
				</div>
			)}
		</>
	);
}