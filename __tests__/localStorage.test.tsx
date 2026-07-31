/**
 * @jest-environment jsdom
 */

import {
  getRecentSearches,
  updateRecentSearches,
} from '@/components/search/SearchBar/SearchBar';
import usePersistantState from '@/modules/usePersistantState';
import { act, renderHook, waitFor } from '@testing-library/react';
import { mockSearchQuery } from '../mocks/SearchQuery.mocks';

describe('localStorage errors', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
  });

  it('uses the missing-value fallback when persistent state cannot be read', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    const { result } = renderHook(() =>
      usePersistantState('test-key', 'initial', true, 'default'),
    );

    await waitFor(() => expect(result.current[0]).toBe('default'));
  });

  it('updates persistent state in memory when storage cannot be written', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    const { result } = renderHook(() =>
      usePersistantState('test-key', 'initial'),
    );

    act(() => result.current[1]('updated'));

    expect(result.current[0]).toBe('updated');
  });

  it('returns no recent searches when storage cannot be read', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    expect(getRecentSearches()).toEqual([]);
  });

  it('does not throw when recent searches cannot be written', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    expect(() => updateRecentSearches([mockSearchQuery])).not.toThrow();
  });
});
