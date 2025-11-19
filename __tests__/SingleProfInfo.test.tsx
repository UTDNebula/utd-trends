/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SingleProfInfo from '@/components/common/SingleProfInfo/SingleProfInfo';
import { mockRMP, mockRmpNoRatings } from '../mocks/RMP.mocks.tsx';

describe('SingleProfInfo', () => {
  it('displays average rating', () => {
    render(<SingleProfInfo rmp={mockRMP} />);

    // displays average rating
    const rating = screen.getByText(mockRMP.avgRating.toFixed(1));

    expect(rating).toBeInTheDocument();
  });

  it('displays N/A given no ratings', () => {
    render(<SingleProfInfo rmp={mockRmpNoRatings} />);

    // displays average rating
    const rating = screen.getByText('N/A');

    expect(rating).toBeInTheDocument();
  });
});
