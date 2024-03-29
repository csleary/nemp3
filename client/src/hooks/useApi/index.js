import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

const percentComplete = (loaded, total) => Math.floor((loaded / total) * 100);

const useApi = (_url, options = {}) => {
  const { method: _method = 'get', data: _data, shouldFetch = true } = options;
  const [isLoading, setLoading] = useState(true);
  const [isFetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [resData, setResData] = useState();
  const [isCancelled, setCancelled] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const call = useRef();
  const isMounted = useRef(true);

  const fetch = useCallback(
    async (url = _url, method = _method, data = _data) => {
      if (!url) return;
      if (call.current) call.current.cancel();

      try {
        call.current = axios.CancelToken.source();
        setFetching(true);

        const res = await axios({
          method,
          url,
          data,
          cancelToken: call.current.token,
          onUploadProgress: e => setUploadProgress(percentComplete(e.loaded / e.total)),
          onDownloadProgress: e => setDownloadProgress(percentComplete(e.loaded / e.total))
        });

        setResData(res.data);
        setError('');
      } catch (e) {
        if (axios.isCancel(e)) {
          if (isMounted.current) setCancelled(true);
        } else {
          setCancelled(false);
          setError(e.response.data.error);
        }
      } finally {
        setFetching(false);
        setLoading(false);
        call.current = null;
      }
    },
    [_url, _method, _data]
  );

  useEffect(() => {
    if (shouldFetch) {
      fetch();
    }

    return () => {
      if (call.current) call.current.cancel();
      isMounted.current = false;
    };
  }, [fetch, shouldFetch]);

  return {
    fetch,
    cancel: call.current?.cancel,
    data: resData,
    error,
    isCancelled,
    isFetching,
    isLoading,
    uploadProgress,
    downloadProgress
  };
};

export { useApi };
